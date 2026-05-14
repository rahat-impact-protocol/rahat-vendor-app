export { useGoogleAuth } from './useGoogleAuth';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  transactionService,
  beneficiaryService,
  projectService,
  redemptionService,
  vendorService,
} from '@/services';

// ─── Transaction hooks ────────────────────────────────────────────
export const useTransactions = (projectId: string) =>
  useQuery({
    queryKey: ['transactions', projectId],
    queryFn: () => transactionService.getTransactions(projectId),
  });

export const useRecentTransactions = (projectId: string) =>
  useQuery({
    queryKey: ['transactions', projectId, 'recent'],
    queryFn: () => transactionService.getRecentTransactions(projectId),
  });

// ─── Beneficiary hooks ────────────────────────────────────────────
export const useBeneficiaries = (projectId: string) =>
  useQuery({
    queryKey: ['beneficiaries', projectId],
    queryFn: () => beneficiaryService.getBeneficiaries(projectId),
  });

export const useFindBeneficiary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (phone: string) => transactionService.chargeByPhone(phone, 'p-001'),
  });
};

// ─── Project hooks ────────────────────────────────────────────────
export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects('v-001'),
  });

export const useProjectBalance = (projectId: string) =>
  useQuery({
    queryKey: ['balance', projectId],
    queryFn: () => projectService.getProjectBalance(projectId),
  });

// ─── Redemption hooks ─────────────────────────────────────────────
export const useRedemptions = () =>
  useQuery({
    queryKey: ['redemptions'],
    queryFn: () => redemptionService.getRedemptions('v-001'),
  });

export const useRedemptionStats = () =>
  useQuery({
    queryKey: ['redemption-stats'],
    queryFn: () => redemptionService.getStats('v-001'),
  });

export const useSubmitRedemption = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => redemptionService.submitRedemptionRequest(amount, 'v-001'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['redemptions'] });
      qc.invalidateQueries({ queryKey: ['redemption-stats'] });
    },
  });
};

// ─── Profile hooks ────────────────────────────────────────────────
export const useProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: () => vendorService.getProfile(),
  });
