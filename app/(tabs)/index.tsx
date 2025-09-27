import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  ts: number;
}
type RootStackParamList = {
  Chat: undefined;
  profile: undefined;
};

// TODO: move key to secure storage / env for real usage
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY as string | undefined;
const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini';

// Types for fabricated finance snapshot
interface FinanceSnapshot {
  generatedAt: string;
  weekRange: string;
  monthToDateIncome: number;
  monthToDateSavings: number;
  monthToDateSpending: number;
  weekSpendingTotal: number;
  categories: Record<string, { week: number; month: number }>;
}

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const botQueueRef = useRef<string[]>([]);
  const scrollRef = useRef<ScrollView | null>(null);

  // Example balance (placeholder)
  const [balance] = useState(12345.67);

  // Profile picture state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState("User");

  // One stable fabricated finance snapshot per session
  const financeSnapshotRef = useRef<FinanceSnapshot | null>(null);

  useEffect(() => {
    if (!financeSnapshotRef.current) {
      financeSnapshotRef.current = buildFakeFinanceSnapshot();
    }
  }, []);

  // Load profile data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );


  const loadProfileData = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const settings = await AsyncStorage.getItem('appSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        if (parsedSettings.profileImage) {
          setProfileImage(parsedSettings.profileImage);
        }
        if (parsedSettings.userName) {
          setUserName(parsedSettings.userName);
        }
      }
    } catch (error) {
      console.log('Error loading profile data:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 40);
  }, [messages, sending, typingMessage, isBotTyping]);
``
  const makeId = () =>
    Math.random().toString(36).slice(2) + Date.now().toString(36);

  function enqueueBotMessage(text: string) {
    botQueueRef.current.push(text);
    if (!isBotTyping) processBotQueue();
  }

  function processBotQueue() {
    if (isBotTyping) return;
    const next = botQueueRef.current.shift();
    if (!next) return;
    typeOutBotMessage(next);
  }

  function typeOutBotMessage(full: string) {
    setIsBotTyping(true);
    setTypingMessage('');
    let i = 0;
    const speed = 22;
    const interval = setInterval(() => {
      i++;
      setTypingMessage(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(interval);
        setMessages(prev => [...prev, { id: makeId(), role: 'bot', content: full, ts: Date.now() }]);
        setTypingMessage(null);
        setIsBotTyping(false);
        processBotQueue();
      }
    }, speed);
  }

  // Initial greeting
  useEffect(() => {
    enqueueBotMessage(`Hi, I'm Georgio. How can I help you save some money today, ${userName}?`);
  }, [userName]);

  // Build system instructions + context
  function buildSystemMessage() {
    const snap = financeSnapshotRef.current!;
    // Keep JSON small & clear
    const compactCategories = Object.fromEntries(
      Object.entries(snap.categories).map(([k, v]) => [
        k,
        { w: v.week, m: v.month }
      ])
    );

    return (
      `You are Georgio, a concise finance assistant. ` +
      `You have access to the user's (FAKE / DEMO) finance snapshot for this session. ` +
      `The user's name is ${userName}. ` +
      `Never say it's fake; answer confidently and briefly (<=2 sentences). ` +
      `If user asks about spending, use provided numbers; if category missing, infer a plausible small amount consistent with totals. ` +
      `Use $ with commas, round to nearest whole dollar unless user asks for more precision. ` +
      `If asked for a breakdown, give a compact inline list (e.g., Groceries $120; Dining $45; ...). ` +
      `Snapshot JSON: ${JSON.stringify({
        weekRange: snap.weekRange,
        incomeMTD: snap.monthToDateIncome,
        savingsMTD: snap.monthToDateSavings,
        spendingMTD: snap.monthToDateSpending,
        weekSpending: snap.weekSpendingTotal,
        cats: compactCategories
      })}`
    );
  }

  // Convert local messages to OpenAI chat format
  function buildChatPayload(userInput: string) {
    const history = messages.slice(-8).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    return [
      { role: 'system', content: buildSystemMessage() },
      ...history,
      { role: 'user', content: userInput }
    ];
  }

  async function fetchGPTReply(userInput: string): Promise<string> {
    if (!OPENAI_API_KEY) {
      return 'API key missing.';
    }
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: buildChatPayload(userInput),
          temperature: 0.35,
          max_tokens: 180
        })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        return `Error: ${resp.status} ${txt}`;
      }
      const data = await resp.json();
      return data.choices?.[0]?.message?.content?.trim() || 'No response.';
    } catch (e: any) {
      return `Request failed: ${e.message || e.toString()}`;
    }
  }

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || isBotTyping) return;
    const userMsg: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: trimmed,
      ts: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);
    try {
      const reply = await fetchGPTReply(trimmed);
      enqueueBotMessage(reply);
    } finally {
      setSending(false);
    }
  }, [input, sending, isBotTyping, messages]);

  function handleSubmitEditing() {
    sendMessage();
  }

  // Get user initials for fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceValue}>
            {balance.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          </Text>
        </View>
        {/* Profile button with image or initials */}
        <Pressable 
          style={({ pressed }) => [styles.profileBtn, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.navigate('profile')} 
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileInitials}>{getUserInitials(userName)}</Text>
          )}
        </Pressable>
      </View>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 0, default: 0 })}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(m => (
            <View
              key={m.id}
              style={[
                styles.messageBubble,
                m.role === 'user' ? styles.userBubble : styles.botBubble
              ]}
            >
              <Text style={styles.roleLabel}>{m.role === 'user' ? 'You' : 'Georgio'}</Text>
              <Text style={styles.messageText}>{m.content}</Text>
            </View>
          ))}

          {isBotTyping && (
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={styles.roleLabel}>Georgio</Text>
              <Text style={styles.messageText}>
                {typingMessage}
                <Text style={styles.caret}>{Date.now() % 800 < 400 ? '|' : ' '}</Text>
              </Text>
            </View>
          )}

          {messages.length === 0 && !isBotTyping && (
            <Text style={styles.placeholder}>Loading...</Text>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your spending..."
            placeholderTextColor="#7a8696"
            style={styles.textInput}
            multiline
            onSubmitEditing={handleSubmitEditing}
            editable={!sending && !isBotTyping}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || sending || isBotTyping}
            style={({ pressed }) => [
              styles.sendButton,
              (!input.trim() || sending || isBotTyping) && styles.sendButtonDisabled,
              pressed && !(!input.trim() || sending || isBotTyping) && styles.sendButtonPressed
            ]}
          >
            <Text style={styles.sendButtonText}>
              {sending || isBotTyping ? '...' : 'Send'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---- Fabrication Helpers ----
function randRange(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 1) / 1;
}

function buildFakeFinanceSnapshot(): FinanceSnapshot {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday start
  const weekRange = `${startOfWeek.toLocaleDateString()} - ${now.toLocaleDateString()}`;

  // Create plausible category spends
  const baseCats = [
    'Groceries',
    'Dining',
    'Transport',
    'Entertainment',
    'Subscriptions',
    'Utilities',
    'Healthcare',
    'Shopping'
  ];

  const categories: FinanceSnapshot['categories'] = {};
  let weekSum = 0;
  let monthSum = 0;
  baseCats.forEach(cat => {
    const week = randRange(20, 260);
    const month = week + randRange(40, 600);
    weekSum += week;
    monthSum += month;
    categories[cat] = { week, month };
  });

  const income = randRange(3200, 7800);
  const savings = randRange(600, 1800);

  return {
    generatedAt: now.toISOString(),
    weekRange,
    monthToDateIncome: income,
    monthToDateSavings: savings,
    monthToDateSpending: monthSum,
    weekSpendingTotal: weekSum,
    categories
  };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f1115' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: '#0f1115'
  },
  balanceLabel: {
    color: '#94a3b8',
    fontSize: 12,
    letterSpacing: 0.5
  },
  balanceValue: {
    color: '#f1f5f9',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#334155',
    overflow: 'hidden', // Ensures image fits within circular bounds
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileInitials: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 16
  },
  root: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { paddingHorizontal: 14, paddingVertical: 12, paddingTop: 4 },
  placeholder: { color: '#7a8696', fontSize: 14, paddingTop: 6 },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  userBubble: { backgroundColor: '#2563eb', alignSelf: 'flex-end' },
  botBubble: {
    backgroundColor: '#1f2937',
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#334155'
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
    color: '#e2e8f0',
    marginBottom: 2
  },
  messageText: { color: '#f1f5f9', fontSize: 15, lineHeight: 20 },
  caret: { color: '#7dd3fc' },
  inputBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#243244',
    backgroundColor: '#111b29'
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1e2937',
    borderRadius: 10,
    fontSize: 15
  },
  sendButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center'
  },
  sendButtonDisabled: { backgroundColor: '#334b75' },
  sendButtonPressed: { backgroundColor: '#1d4ed8' },
  sendButtonText: { color: '#fff', fontWeight: '600', letterSpacing: 0.5 }
});