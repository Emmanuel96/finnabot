import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  note?: string;
}

export default function FinanceDashboard() {
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const transactions: Transaction[] = [
    { id: 't1', date: `${monthKey}-01`, category: 'Groceries', amount: -82.34 },
    { id: 't2', date: `${monthKey}-02`, category: 'Dining', amount: -24.5 },
    { id: 't3', date: `${monthKey}-02`, category: 'Salary', amount: 3200 },
    { id: 't4', date: `${monthKey}-03`, category: 'Transport', amount: -12.6 },
    { id: 't5', date: `${monthKey}-04`, category: 'Subscriptions', amount: -19.99 },
    { id: 't6', date: `${monthKey}-05`, category: 'Investments', amount: -150 },
    { id: 't7', date: `${monthKey}-06`, category: 'Dining', amount: -31.2 },
    { id: 't8', date: `${monthKey}-07`, category: 'Savings Transfer', amount: 400 },
    { id: 't9', date: `${monthKey}-08`, category: 'Groceries', amount: -63.9 },
    { id: 't10', date: `${monthKey}-09`, category: 'Utilities', amount: -120.75 },
    { id: 't11', date: `${monthKey}-10`, category: 'Transport', amount: -9.8 },
    { id: 't12', date: `${monthKey}-11`, category: 'Dining', amount: -18.4 },
    { id: 't13', date: `${monthKey}-12`, category: 'Healthcare', amount: -42.15 },
    { id: 't14', date: `${monthKey}-13`, category: 'Savings Transfer', amount: 300 },
    { id: 't15', date: `${monthKey}-14`, category: 'Groceries', amount: -57.2 }
  ];

  const {
    income,
    spending,
    net,
    savingsTrend,
    savingsGrowthPct,
    largestCategories
  } = useMemo(() => {
    const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const spending = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const net = income - spending;

    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.amount < 0) {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
      }
    });

    const largestCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const savingsPoints: number[] = [];
    let cumulative = 5400;
    transactions
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(t => {
        if (t.category === 'Savings Transfer') cumulative += t.amount;
        if (t.category === 'Salary') cumulative += t.amount * 0.25;
        savingsPoints.push(cumulative);
      });

    const savingsTrend = savingsPoints;
    const savingsGrowthPct =
      savingsTrend.length > 1
        ? ((savingsTrend[savingsTrend.length - 1] - savingsTrend[0]) / savingsTrend[0]) * 100
        : 0;

    return {
      income,
      spending,
      net,
      savingsTrend,
      savingsGrowthPct,
      largestCategories
    };
  }, [transactions]);

  const maxCategory = Math.max(...largestCategories.map(c => c[1]), 1);
  const maxSavings = Math.max(...savingsTrend, 1);
  const minSavings = Math.min(...savingsTrend, 0);
  const range = Math.max(maxSavings - minSavings, 1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.heading}>Monthly Finance Dashboard</ThemedText>
      <ThemedText style={styles.subHeading}>
        {today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}
      </ThemedText>

      <View style={styles.row}>
        <MetricCard label="Income" value={`$${income.toFixed(2)}`} accent="#10b981" />
        <MetricCard label="Spending" value={`$${spending.toFixed(2)}`} accent="#ef4444" />
      </View>
      <View style={styles.row}>
        <MetricCard label="Net" value={`$${net.toFixed(2)}`} accent={net >= 0 ? '#3b82f6' : '#ef4444'} />
        <MetricCard
          label="Savings Growth"
          value={`${savingsGrowthPct.toFixed(1)}%`}
          accent={savingsGrowthPct >= 0 ? '#8b5cf6' : '#ef4444'}
        />
      </View>

      <Section title="Top Spending Categories">
        <View style={styles.barChart}>
          {largestCategories.map(([cat, val]) => {
            const widthPct = (val / maxCategory) * 100;
            return (
              <View key={cat} style={styles.barRow}>
                <ThemedText style={styles.barLabel}>{cat}</ThemedText>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${widthPct}%`, backgroundColor: pickColor(cat) }]} />
                </View>
                <ThemedText style={styles.barValue}>${val.toFixed(0)}</ThemedText>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="Savings Trend">
        <View style={styles.lineChart}>
          {savingsTrend.map((val, i) => {
            const norm = (val - minSavings) / range;
            return (
              <View key={i} style={styles.linePointContainer}>
                <View style={[styles.linePoint, { height: `${norm * 100}%`, backgroundColor: '#8b5cf6' }]} />
              </View>
            );
          })}
        </View>
        <View style={styles.lineChartFooter}>
          <ThemedText style={styles.smallNote}>Start: ${savingsTrend[0]?.toFixed(0)}</ThemedText>
          <ThemedText style={styles.smallNote}>
            End: ${savingsTrend[savingsTrend.length - 1]?.toFixed(0)}
          </ThemedText>
        </View>
      </Section>

      <Section title="Recent Activity">
        <View style={styles.txList}>
          {transactions.slice().reverse().slice(0, 8).map(t => (
            <View key={t.id} style={styles.txRow}>
              <ThemedText style={styles.txDate}>
                {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </ThemedText>
              <ThemedText style={styles.txCat}>{t.category}</ThemedText>
              <ThemedText style={[styles.txAmount, { color: t.amount < 0 ? '#ef4444' : '#10b981' }]}>
                {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
              </ThemedText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Insights">
        <ThemedText style={styles.insight}>
          You spent {((spending / income) * 100).toFixed(1)}% of income. Target &lt; 70%.
        </ThemedText>
        <ThemedText style={styles.insight}>
          Dining share: {percentOfCategory('Dining', largestCategories)}% of tracked spending.
        </ThemedText>
        <ThemedText style={styles.insight}>
          Savings growth: {savingsGrowthPct.toFixed(1)}% this month.
        </ThemedText>
      </Section>

      <View style={{ height: 56 }} />
    </ScrollView>
  );
}

function percentOfCategory(cat: string, list: [string, number][]) {
  const total = list.reduce((s, [, v]) => s + v, 0);
  const catVal = list.find(c => c[0] === cat)?.[1] || 0;
  return total ? ((catVal / total) * 100).toFixed(1) : '0.0';
}

function pickColor(cat: string) {
  const map: Record<string, string> = {
    Groceries: '#16a34a',
    Dining: '#f59e0b',
    Transport: '#0891b2',
    Utilities: '#6366f1',
    Subscriptions: '#ea580c',
    Healthcare: '#dc2626',
    Investments: '#7c3aed',
    'Savings Transfer': '#8b5cf6'
  };
  return map[cat] || '#3b82f6';
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </ThemedView>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={[styles.metricCard, { borderColor: accent }]}>
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      <ThemedText style={[styles.metricValue, { color: accent }]}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { fontSize: 26, marginTop: 50, marginBottom: 2, fontWeight: '700' },
  subHeading: { opacity: 0.65, marginBottom: 18 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1
  },
  metricLabel: { fontSize: 12, opacity: 0.7, marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: '600' },
  section: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  sectionTitle: { marginBottom: 12, fontWeight: '600' },
  barChart: { gap: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 90, fontSize: 12, opacity: 0.8 },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    overflow: 'hidden'
  },
  barFill: { height: '100%', borderRadius: 8 },
  barValue: { width: 52, textAlign: 'right', fontSize: 12, opacity: 0.85 },
  lineChart: {
    flexDirection: 'row',
    height: 140,
    alignItems: 'flex-end',
    gap: 4,
    paddingVertical: 6
  },
  linePointContainer: { flex: 1, justifyContent: 'flex-end' },
  linePoint: { width: '100%', borderRadius: 4 },
  lineChartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  smallNote: { fontSize: 11, opacity: 0.6 },
  txList: { marginTop: 4 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)'
  },
  txDate: { width: 70, fontSize: 12, opacity: 0.7 },
  txCat: { flex: 1, fontSize: 14 },
  txAmount: { width: 90, textAlign: 'right', fontWeight: '600', fontSize: 13 },
  insight: { fontSize: 13, marginBottom: 8, lineHeight: 18 }
});
