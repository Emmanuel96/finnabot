import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// You'll need to install these if not already available:
// npm install @expo/vector-icons @react-native-async-storage/async-storage

// For now, we'll create a simple icon component to replace Ionicons
// You can replace this with actual Ionicons when you install it
const SimpleIcon = ({ name, size = 20, color = "#94a3b8" }: { name: string; size?: number; color?: string }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size/4 }} />
);

type RootStackParamList = {
  Chat: undefined;
  Profile: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Display & Accessibility Settings
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode to match your theme
  const [textSize, setTextSize] = useState("Medium");
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Privacy & Security Settings
  const [biometricLock, setBiometricLock] = useState(false);
  const [autoLockTimer, setAutoLockTimer] = useState("5 minutes");

  // Notification Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStartTime, setQuietStartTime] = useState("22:00");
  const [quietEndTime, setQuietEndTime] = useState("08:00");
  const [reminderFrequency, setReminderFrequency] = useState("Daily");

  // Contact Settings
  const [crisisContact, setCrisisContact] = useState("");
  const [bankContact, setBankContact] = useState("");

  // Wellbeing Settings
  const [safeMode, setSafeMode] = useState(false);
  const [breakReminders, setBreakReminders] = useState(true);
  const [saveGame, setSaveGame] = useState("5 minutes");
  const [breathingStyle, setBreathingStyle] = useState("4-7-8 Technique");
  const [offlineMode, setOfflineMode] = useState(false);

  // Profile Picture
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // User Profile Data
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userBio, setUserBio] = useState("");

  // Load settings from local storage on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
  }, [
    darkMode, textSize, highContrast, reduceMotion, biometricLock, autoLockTimer,
    notificationsEnabled, quietHoursEnabled, quietStartTime, quietEndTime, reminderFrequency,
    crisisContact, bankContact, safeMode, breakReminders, saveGame, 
    breathingStyle, offlineMode, profileImage, userName, userEmail, userBio
  ]);

  /**
   * Loads settings from local storage
   */
  const loadSettings = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const settings = await AsyncStorage.getItem('appSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        
        // Apply all saved settings
        if (parsedSettings.darkMode !== undefined) setDarkMode(parsedSettings.darkMode);
        if (parsedSettings.textSize) setTextSize(parsedSettings.textSize);
        if (parsedSettings.highContrast !== undefined) setHighContrast(parsedSettings.highContrast);
        if (parsedSettings.reduceMotion !== undefined) setReduceMotion(parsedSettings.reduceMotion);
        if (parsedSettings.biometricLock !== undefined) setBiometricLock(parsedSettings.biometricLock);
        if (parsedSettings.autoLockTimer) setAutoLockTimer(parsedSettings.autoLockTimer);
        if (parsedSettings.notificationsEnabled !== undefined) setNotificationsEnabled(parsedSettings.notificationsEnabled);
        if (parsedSettings.quietHoursEnabled !== undefined) setQuietHoursEnabled(parsedSettings.quietHoursEnabled);
        if (parsedSettings.quietStartTime) setQuietStartTime(parsedSettings.quietStartTime);
        if (parsedSettings.quietEndTime) setQuietEndTime(parsedSettings.quietEndTime);
        if (parsedSettings.reminderFrequency) setReminderFrequency(parsedSettings.reminderFrequency);
        if (parsedSettings.crisisContact) setCrisisContact(parsedSettings.crisisContact);
        if (parsedSettings.bankContact) setBankContact(parsedSettings.bankContact);
        if (parsedSettings.safeMode !== undefined) setSafeMode(parsedSettings.safeMode);
        if (parsedSettings.breakReminders !== undefined) setBreakReminders(parsedSettings.breakReminders);
        if (parsedSettings.saveGame) setSaveGame(parsedSettings.saveGame);
        if (parsedSettings.breathingStyle) setBreathingStyle(parsedSettings.breathingStyle);
        if (parsedSettings.offlineMode !== undefined) setOfflineMode(parsedSettings.offlineMode);
        if (parsedSettings.profileImage) setProfileImage(parsedSettings.profileImage);
        if (parsedSettings.userName) setUserName(parsedSettings.userName);
        if (parsedSettings.userEmail) setUserEmail(parsedSettings.userEmail);
        if (parsedSettings.userBio) setUserBio(parsedSettings.userBio);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  /**
   * Saves settings to local storage
   */
  const saveSettings = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const settings = {
        darkMode, textSize, highContrast, reduceMotion, biometricLock, autoLockTimer,
        notificationsEnabled, quietHoursEnabled, quietStartTime, quietEndTime, reminderFrequency,
        crisisContact, bankContact, safeMode, breakReminders, saveGame, 
        breathingStyle, offlineMode, profileImage, userName, userEmail, userBio
      };
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const textSizeOptions = ["Small", "Medium", "Large", "Extra Large"];
  const autoLockOptions = ["Immediate", "1 minute", "5 minutes", "15 minutes", "Never"];
  const reminderFrequencyOptions = ["Never", "Daily", "Twice daily", "Weekly"];
  const saveGameOptions = ["2 minutes", "5 minutes", "10 minutes", "15 minutes"];
  const breathingStyleOptions = ["4-7-8 Technique", "Box Breathing", "Equal Breathing", "Deep Belly"];

  // Image picker functions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access to upload images.');
      return false;
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Select Profile Picture",
      "Choose how you'd like to add your profile picture",
      [
        { text: "Camera", onPress: takePhotoWithCamera },
        { text: "Photo Library", onPress: pickImageFromLibrary },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // Theme colors matching your existing dark theme
  const theme = {
    colors: {
      background: "#0f1115",
      surface: "#1e293b",
      text: "#f1f5f9",
      textSecondary: "#94a3b8",
      textDisabled: "#64748b",
      border: "#334155",
      borderLight: "#475569",
      icon: "#94a3b8",
      iconDisabled: "#64748b",
      primary: "#2563eb",
      accent: "#7dd3fc",
      error: "#ef4444",
    }
  };

  /**
   * Renders a toggle switch row
   */
  const renderToggleRow = (title: string, subtitle: string, value: boolean, onToggle: (value: boolean) => void, disabled = false) => (
    <View style={[styles.settingRow, { borderBottomColor: theme.colors.borderLight }, disabled && styles.disabledRow]}>
      <View style={styles.settingLeft}>
        <SimpleIcon name="icon" size={20} color={disabled ? theme.colors.iconDisabled : theme.colors.icon} />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: disabled ? theme.colors.textDisabled : theme.colors.text }]}>{title}</Text>
          <Text style={[styles.settingSubtitle, { color: disabled ? theme.colors.textDisabled : theme.colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor="#FFFFFF"
        disabled={disabled}
      />
    </View>
  );

  /**
   * Renders a picker row with options
   */
  const renderPickerRow = (title: string, subtitle: string, value: string, options: string[], onSelect: (value: string) => void, disabled = false) => (
    <TouchableOpacity 
      style={[styles.settingRow, { borderBottomColor: theme.colors.borderLight }, disabled && styles.disabledRow]}
      onPress={() => {
        if (disabled) return;
        Alert.alert(
          title,
          "Select an option:",
          [
            ...options.map(option => ({
              text: option,
              onPress: () => onSelect(option),
            })),
            { text: "Cancel", style: "cancel" as const }
          ]
        );
      }}
    >
      <View style={styles.settingLeft}>
        <SimpleIcon name="icon" size={20} color={disabled ? theme.colors.iconDisabled : theme.colors.icon} />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: disabled ? theme.colors.textDisabled : theme.colors.text }]}>{title}</Text>
          <Text style={[styles.settingSubtitle, { color: disabled ? theme.colors.textDisabled : theme.colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        <Text style={[styles.settingValue, { color: disabled ? theme.colors.textDisabled : theme.colors.textSecondary }]}>{value}</Text>
        <Text style={[styles.chevron, { color: disabled ? theme.colors.iconDisabled : theme.colors.icon }]}>›</Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * Renders an input row for text entry
   */
  const renderInputRow = (title: string, subtitle: string, value: string, onChangeText: (text: string) => void, placeholder: string) => (
    <View style={[styles.settingRow, { borderBottomColor: theme.colors.borderLight }]}>
      <View style={styles.settingLeft}>
        <SimpleIcon name="icon" size={20} color={theme.colors.icon} />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <TextInput
        style={[styles.settingInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profile Information</Text>
          
          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <TouchableOpacity onPress={showImagePickerOptions} style={styles.profilePictureWrapper}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profilePicture} />
              ) : (
                <View style={[styles.profilePicturePlaceholder, { backgroundColor: theme.colors.border }]}>
                  <Text style={[styles.profilePicturePlaceholderText, { color: theme.colors.textSecondary }]}>
                    Add Photo
                  </Text>
                </View>
              )}
              <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.editBadgeText}>✏️</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* User Information */}
          {renderInputRow(
            "Display Name",
            "Your name as it appears to others",
            userName,
            setUserName,
            "Your name"
          )}

          {renderInputRow(
            "Email",
            "Your email address",
            userEmail,
            setUserEmail,
            "email@example.com"
          )}

          <View style={[styles.settingRow, { borderBottomColor: theme.colors.borderLight }]}>
            <View style={styles.settingLeft}>
              <SimpleIcon name="icon" size={20} color={theme.colors.icon} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Bio</Text>
                <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>Tell others about yourself</Text>
              </View>
            </View>
          </View>
          <TextInput
            style={[styles.bioInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text }]}
            value={userBio}
            onChangeText={setUserBio}
            placeholder="Write something about yourself..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>
        {/* Display & Accessibility */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Display & Accessibility</Text>
          
          {renderToggleRow(
            "Dark Mode",
            "Switch between light and dark themes",
            darkMode,
            setDarkMode
          )}

          {renderPickerRow(
            "Text Size",
            "Adjust text size for better readability",
            textSize,
            textSizeOptions,
            setTextSize
          )}

          {renderToggleRow(
            "High Contrast",
            "Increase contrast for better visibility",
            highContrast,
            setHighContrast
          )}

          {renderToggleRow(
            "Reduce Motion",
            "Minimize animations and transitions",
            reduceMotion,
            setReduceMotion
          )}
        </View>

        {/* Privacy & Security */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Privacy & Security</Text>

          <View style={[styles.settingRow, { borderBottomColor: theme.colors.borderLight }]}>
            <View style={styles.settingLeft}>
              <SimpleIcon name="eye-off" size={20} color={theme.colors.icon} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Hide App Content</Text>
                <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>Automatically blur app in recent apps</Text>
              </View>
            </View>
            <View style={styles.enabledIndicator}>
              <Text style={styles.enabledText}>Enabled</Text>
            </View>
          </View>

          {renderToggleRow(
            "Biometric Lock",
            "Use fingerprint or Face ID to unlock app",
            biometricLock,
            setBiometricLock
          )}

          {renderPickerRow(
            "Auto-Lock Timer",
            "Automatically lock app after inactivity",
            autoLockTimer,
            autoLockOptions,
            setAutoLockTimer
          )}
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>

          {renderToggleRow(
            "Enable Notifications",
            "Receive reminders and check-ins",
            notificationsEnabled,
            setNotificationsEnabled
          )}

          {renderToggleRow(
            "Quiet Hours",
            "No notifications during specified times",
            quietHoursEnabled,
            setQuietHoursEnabled
          )}

          {quietHoursEnabled && (
            <View style={styles.nestedSettings}>
              <View style={styles.timeRow}>
                <Text style={[styles.timeLabel, { color: theme.colors.text }]}>From:</Text>
                <TextInput
                  style={[styles.timeInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={quietStartTime}
                  onChangeText={setQuietStartTime}
                  placeholder="22:00"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <Text style={[styles.timeLabel, { color: theme.colors.text }]}>To:</Text>
                <TextInput
                  style={[styles.timeInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={quietEndTime}
                  onChangeText={setQuietEndTime}
                  placeholder="08:00"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>
          )}

          {renderPickerRow(
            "Reminder Frequency",
            "How often to receive wellness reminders",
            reminderFrequency,
            reminderFrequencyOptions,
            setReminderFrequency
          )}
        </View>

        {/* Emergency Contacts */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Emergency Contacts</Text>

          {renderInputRow(
            "Crisis Contact",
            "Emergency contact for crisis situations",
            crisisContact,
            setCrisisContact,
            "Phone number or name"
          )}

          {renderInputRow(
            "Bank",
            "Your bank contact",
            bankContact,
            setBankContact,
            "Contact information"
          )}
        </View>

        {/* Wellbeing Features */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Saving  Games </Text>

          {renderToggleRow(
            "Safe Mode",
            "Hide potentially triggering content",
            safeMode,
            setSafeMode
          )}

          {renderToggleRow(
            "Break Reminders",
            "Remind you to take breaks during extended use",
            breakReminders,
            setBreakReminders
          )}

          {renderPickerRow(
            "Save Game",
            "Default length for save game",
            saveGame,
            saveGameOptions,
            setSaveGame
          )}

          {renderPickerRow(
            "Breathing Exercise Style",
            "Preferred breathing technique",
            breathingStyle,
            breathingStyleOptions,
            setBreathingStyle
          )}

          {renderToggleRow(
            "Offline Mode",
            "Use app without internet connection",
            offlineMode,
            setOfflineMode
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#334155",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40, // To balance the back button
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  disabledRow: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    fontWeight: "300",
  },
  settingInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    width: 150,
    textAlign: "right" as const,
  },
  enabledIndicator: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enabledText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  nestedSettings: {
    marginLeft: 32,
    paddingTop: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  timeLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    width: 60,
    textAlign: "center" as const,
    marginRight: 16,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePictureWrapper: {
    position: "relative",
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#475569",
    borderStyle: "dashed",
  },
  profilePicturePlaceholderText: {
    fontSize: 12,
    fontWeight: "500",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0f1115",
  },
  editBadgeText: {
    fontSize: 12,
  },
  bioInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: 8,
    marginHorizontal: 32,
    textAlignVertical: "top",
    minHeight: 80,
  },
});