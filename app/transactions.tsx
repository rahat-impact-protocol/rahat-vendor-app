import React from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { Colors } from '@/constants/tokens';
import { transactionService, type TransactionApiResponse } from '@/services';
import { useAuthStore, useProjectStore } from '@/stores';
import type { Transaction } from '@/types';

function mapTx(tx: TransactionApiResponse): Transaction {
  return {
    id: tx.transactionHash,
    amount: tx.amount,
    tokenAmount: Number(tx.amount) || 0,
    hash: tx.transactionHash,
    actionType: tx.actionType ?? "Transaction",
    mode: tx.actionType?.toLowerCase() === "offline" ? "offline" : "online",
    status: tx.status,
    date: new Date(tx.createdAt).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    projectId: "",
  };
}

const PER_PAGE = 15;

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const vendor = useAuthStore((s) => s.vendor);
  const token = useAuthStore((s) => s.accessToken);
  const project = useProjectStore((s) => s.activeProject);

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const fetchPage = React.useCallback(async (pageNum: number, append: boolean) => {
    if (!vendor?.walletAddress || !project?.baseUrl) return;
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const { data, meta } = await transactionService.getTransaction(
        project.baseUrl,
        vendor.walletAddress,
        token ?? '',
        pageNum,
        PER_PAGE,
      );
      const mapped = data.map(mapTx);
      setTransactions((prev) => append ? [...prev, ...mapped] : mapped);
      setHasNextPage(meta.hasNextPage);
      setPage(pageNum);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [vendor?.walletAddress, project?.baseUrl, token]);

  React.useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = React.useCallback(() => {
    if (!hasNextPage || loadingMore) return;
    fetchPage(page + 1, true);
  }, [hasNextPage, loadingMore, page, fetchPage]);

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }
    if (!hasNextPage && transactions.length > 0) {
      return <Text style={styles.endText}>No more transactions</Text>;
    }
    return null;
  };

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <PageHeader title="Transactions" showBack />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <PageHeader title="Transactions" showBack />
      <FlatList
        data={transactions}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  listContent: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontFamily: 'Manrope', fontSize: 14, color: Colors.textMuted },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  endText: {
    fontFamily: 'Manrope', fontSize: 12, color: Colors.textMuted,
    textAlign: 'center', paddingVertical: 20,
  },
});
