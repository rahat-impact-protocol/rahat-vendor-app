import React from 'react';
import { View, Alert, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useProjectStore } from '@/stores';
import { chargeService } from '@/services';
import type { BeneficiaryApiResponse } from '@/services';
import { getBeneficiaryOnChainBalance } from '@/utils/contractBalance';
import { phoneSchema, type Step } from '@/components/charge/constants';
import { shared } from '@/components/charge/styles';
import { WizardHeader } from '@/components/charge/WizardHeader';
import { PhoneInputStep } from '@/components/charge/PhoneInputStep';
import { BeneficiaryDetailsStep } from '@/components/charge/BeneficiaryDetailsStep';
import { NoBeneficiaryStep } from '@/components/charge/NoBeneficiaryStep';
import { NoTokenStep } from '@/components/charge/NoTokenStep';
import { AmountStep } from '@/components/charge/AmountStep';
import { QRScannerStep } from '@/components/charge/QRScannerStep';

export default function ChargeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const vendor = useAuthStore((s) => s.vendor);
  const accessToken = useAuthStore((s) => s.accessToken);
  const activeProject = useProjectStore((s) => s.activeProject);

  const [step, setStep] = React.useState<Step>('phone-input');
  const [phone, setPhone] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [beneficiary, setBeneficiary] =
    React.useState<BeneficiaryApiResponse | null>(null);
  const [availableTokens, setAvailableTokens] = React.useState(0);
  const [amount, setAmount] = React.useState('');
  const [amountError, setAmountError] = React.useState('');

  const projectBaseUrl = activeProject?.baseUrl ?? '';
  const token = accessToken ?? '';
  const vendorId = vendor?.id ?? '';

  const validatePhone = (val: string): boolean => {
    const result = phoneSchema.safeParse(val);
    if (!result.success) {
      setPhoneError('Phone number must be 7–19 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const resetFlow = () => {
    setStep('phone-input');
    setPhone('');
    setPhoneError('');
    setBeneficiary(null);
    setAvailableTokens(0);
    setAmount('');
    setAmountError('');
  };

  const handleFindBeneficiary = async () => {
    if (!validatePhone(phone)) return;
    if (!projectBaseUrl) {
      Alert.alert('No Active Project', 'Please select a project first.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      const phonee = phone.trim();
      const ben = await chargeService.getBeneficiaryByPhone(
        projectBaseUrl,
        phonee,
        token,
      );
      console.log('Beneficiary found:', ben);
      setBeneficiary(ben);

      let tokens = 0;
      try {
        const walletAddress = ben.walletAddress;
        if (walletAddress) {
          tokens = await getBeneficiaryOnChainBalance(walletAddress);
        }
      } catch (contractErr: any) {
        console.error(
          'Contract balance fetch failed:',
          contractErr?.message ?? contractErr,
        );
        tokens = 0;
      }

      setAvailableTokens(tokens);
      setStep('beneficiary-details');
    } catch (err: any) {
      if (
        err?.status === 404 ||
        err?.message?.toLowerCase().includes('not found')
      ) {
        setStep('no-beneficiary');
      } else {
        Alert.alert('Error', err?.message ?? 'Failed to find beneficiary.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProceedFromDetails = () => {
    if (availableTokens <= 0) {
      setStep('no-token');
    } else {
      setStep('amount');
    }
  };

  const handleCreateClaim = async () => {
    const numAmount = parseInt(amount, 10);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Enter a valid amount');
      return;
    }
    if (numAmount > availableTokens) {
      setAmountError(
        `Amount cannot exceed available tokens (${availableTokens})`,
      );
      return;
    }

    const amountString = numAmount.toString();

    const ben = String(beneficiary?.walletAddress);
    if (!beneficiary?.walletAddress) {
      Alert.alert('Error', 'Beneficiary wallet address is missing.');
      return;
    }
    setAmountError('');
    setLoading(true);
    try {
      const claim = await chargeService.createClaim(
        projectBaseUrl,
        vendorId,
        {
          amount: amountString,
          benAddress: ben,
        },
        token,
      );
      router.push({
        pathname: '/otp-verify',
        params: {
          benAddress: ben,
          vendorId,
          // claimId: claim.id ?? claim.uuid ?? claim.claimId ?? "",
          phone,
          amount: amountString,
          beneficiaryName: beneficiary.name ?? '',
          projectName: activeProject?.name ?? '',
        },
      });
    } catch (err: any) {
      console.error('Claim creation failed:', err);
      Alert.alert('Claim Failed', err?.message ?? 'Failed to create claim.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanned = async (walletAddress: string) => {
    if (!projectBaseUrl) {
      Alert.alert('No Active Project', 'Please select a project first.');
      return;
    }
    if (!walletAddress) return;

    Keyboard.dismiss();
    setLoading(true);
    try {
      const ben = await chargeService.getBeneficiaryByWallet(
        projectBaseUrl,
        walletAddress,
        token,
      );
      setBeneficiary(ben);
      let tokens = 0;
      try {
        const walletAddress = ben.walletAddress;
        if (walletAddress) {
          tokens = await getBeneficiaryOnChainBalance(walletAddress);
        }
      } catch (contractErr: any) {
        console.error(
          'Contract balance fetch failed:',
          contractErr?.message ?? contractErr,
        );
        tokens = 0;
      }

      setAvailableTokens(tokens);
      setStep('beneficiary-details');
    } catch (err: any) {
      if (
        err?.status === 404 ||
        err?.message?.toLowerCase().includes('not found')
      ) {
        setStep('no-beneficiary');
      } else {
        Alert.alert('Error', err?.message ?? 'Failed to find beneficiary.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[shared.screen, { paddingTop: insets.top }]}>
      <WizardHeader step={step} />

      {step === 'amount' && (
        <AmountStep
          amount={amount}
          setAmount={setAmount}
          amountError={amountError}
          setAmountError={setAmountError}
          availableTokens={availableTokens}
          loading={loading}
          handleCreateClaim={handleCreateClaim}
          onBack={() => setStep('beneficiary-details')}
        />
      )}

      {step === 'no-token' && (
        <NoTokenStep
          beneficiary={beneficiary}
          phone={phone}
          resetFlow={resetFlow}
        />
      )}

      {step === 'beneficiary-details' && beneficiary && (
        <BeneficiaryDetailsStep
          beneficiary={beneficiary}
          phone={phone}
          activeProject={activeProject}
          availableTokens={availableTokens}
          handleProceedFromDetails={handleProceedFromDetails}
          resetFlow={resetFlow}
        />
      )}

      {step === 'no-beneficiary' && (
        <NoBeneficiaryStep phone={phone} resetFlow={resetFlow} />
      )}

      {(step === 'phone-input' ||
        (step === 'beneficiary-details' && !beneficiary)) && (
        <PhoneInputStep
          phone={phone}
          setPhone={setPhone}
          phoneError={phoneError}
          loading={loading}
          activeProject={activeProject}
          handleFindBeneficiary={handleFindBeneficiary}
          validatePhone={validatePhone}
          onQRPress={() => setStep('qr-scan')}
        />
      )}

      {step === 'qr-scan' && (
        <QRScannerStep
          onScanned={handleQRScanned}
          onClose={() => setStep('phone-input')}
          loading={loading}
        />
      )}
    </View>
  );
}
