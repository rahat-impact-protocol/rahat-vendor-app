import React from "react";
import { View, Alert, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore, useProjectStore } from "@/stores";
import { chargeService } from "@/services";
import type { BeneficiaryApiResponse } from "@/services";
import { getBeneficiaryOnChainBalance } from "@/utils/contractBalance";
import { phoneSchema, type Step } from "@/components/charge/constants";
import { shared } from "@/components/charge/styles";
import { WizardHeader } from "@/components/charge/WizardHeader";
import { PhoneInputStep } from "@/components/charge/PhoneInputStep";
import { BeneficiaryDetailsStep } from "@/components/charge/BeneficiaryDetailsStep";
import { NoBeneficiaryStep } from "@/components/charge/NoBeneficiaryStep";
import { NoTokenStep } from "@/components/charge/NoTokenStep";
import { AmountStep } from "@/components/charge/AmountStep";

export default function ChargeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const vendor = useAuthStore((s) => s.vendor);
  const accessToken = useAuthStore((s) => s.accessToken);
  const activeProject = useProjectStore((s) => s.activeProject);

  const [step, setStep] = React.useState<Step>("phone-input");
  const [phone, setPhone] = React.useState("");
  const [phoneError, setPhoneError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [beneficiary, setBeneficiary] =
    React.useState<BeneficiaryApiResponse | null>(null);
  const [availableTokens, setAvailableTokens] = React.useState(0);
  const [amount, setAmount] = React.useState("");
  const [amountError, setAmountError] = React.useState("");

  const projectBaseUrl = activeProject?.baseUrl ?? "";
  const token = accessToken ?? "";
  const vendorId = vendor?.id ?? "";

  const validatePhone = (val: string): boolean => {
    const result = phoneSchema.safeParse(val);
    if (!result.success) {
      setPhoneError("Phone number must be 7–15 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const resetFlow = () => {
    setStep("phone-input");
    setPhone("");
    setPhoneError("");
    setBeneficiary(null);
    setAvailableTokens(0);
    setAmount("");
    setAmountError("");
  };

  const handleFindBeneficiary = async () => {
    if (!validatePhone(phone)) return;
    if (!projectBaseUrl) {
      Alert.alert("No Active Project", "Please select a project first.");
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      const ben = await chargeService.getBeneficiaryByPhone(
        projectBaseUrl,
        phone,
        token,
      );
      setBeneficiary(ben);

      let tokens = 0;
      try {
        const walletAddress = ben.beneficiary?.walletAddress;
        console.log("Beneficiary wallet address:", walletAddress);
        if (walletAddress) {
          tokens = await getBeneficiaryOnChainBalance(walletAddress);
        }
      } catch (contractErr: any) {
        console.error(
          "Contract balance fetch failed:",
          contractErr?.message ?? contractErr,
        );
        tokens = 0;
      }

      console.log("Available tokens for beneficiary:", tokens);
      setAvailableTokens(tokens);
      setStep("beneficiary-details");
    } catch (err: any) {
      if (
        err?.status === 404 ||
        err?.message?.toLowerCase().includes("not found")
      ) {
        setStep("no-beneficiary");
      } else {
        Alert.alert("Error", err?.message ?? "Failed to find beneficiary.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProceedFromDetails = () => {
    if (availableTokens <= 0) {
      setStep("no-token");
    } else {
      setStep("amount");
    }
  };

  const handleCreateClaim = async () => {
    const numAmount = parseInt(amount, 10);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setAmountError("Enter a valid amount");
      return;
    }
    if (numAmount > availableTokens) {
      setAmountError(
        `Amount cannot exceed available tokens (${availableTokens})`,
      );
      return;
    }

    const amountString = numAmount.toString();
    console.log(
      "Creating claim with amount:",
      typeof amountString,
      amountString,
    );
    console.log(
      "Beneficiary details:",
      beneficiary?.beneficiary?.walletAddress,
    );

    const ben = String(beneficiary?.beneficiary?.walletAddress);
    console.log("Payload for claim creation:", typeof ben);
    if (!beneficiary?.beneficiary?.walletAddress) {
      Alert.alert("Error", "Beneficiary wallet address is missing.");
      return;
    }
    setAmountError("");
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
      console.log("Claim created:", claim);
      router.push({
        pathname: "/otp-verify",
        params: {
          benAddress: ben,
           vendorId,
          // claimId: claim.id ?? claim.uuid ?? claim.claimId ?? "",
          phone,
          amount: amountString,
          beneficiaryName: beneficiary.name ?? "",
          projectName: activeProject?.name ?? "",
        },
      });
    } catch (err: any) {
      console.error("Claim creation failed:", err);
      Alert.alert("Claim Failed", err?.message ?? "Failed to create claim.");
    } finally {
      setLoading(false);
    }
  };

  // const maskName = (name?: string): string => {
  //   if (!name) return "—";
  //   return name
  //     .trim()
  //     .split(" ")
  //     .map((w) =>
  //       w.length <= 2
  //         ? w
  //         : `${w[0]}${"*".repeat(w.length - 2)}${w[w.length - 1]}`,
  //     )
  //     .join(" ");
  // };

  return (
    <View style={[shared.screen, { paddingTop: insets.top }]}>
      <WizardHeader step={step} />

      {step === "amount" && (
        <AmountStep
          amount={amount}
          setAmount={setAmount}
          amountError={amountError}
          setAmountError={setAmountError}
          availableTokens={availableTokens}
          loading={loading}
          handleCreateClaim={handleCreateClaim}
          onBack={() => setStep("beneficiary-details")}
        />
      )}

      {step === "no-token" && (
        <NoTokenStep
          beneficiary={beneficiary}
          phone={phone}
          resetFlow={resetFlow}
        />
      )}

      {step === "beneficiary-details" && beneficiary && (
        <BeneficiaryDetailsStep
          beneficiary={beneficiary}
          phone={phone}
          activeProject={activeProject}
          availableTokens={availableTokens}
          handleProceedFromDetails={handleProceedFromDetails}
          resetFlow={resetFlow}
        />
      )}

      {step === "no-beneficiary" && (
        <NoBeneficiaryStep phone={phone} resetFlow={resetFlow} />
      )}

      {(step === "phone-input" ||
        (step === "beneficiary-details" && !beneficiary)) && (
        <PhoneInputStep
          phone={phone}
          setPhone={setPhone}
          phoneError={phoneError}
          loading={loading}
          activeProject={activeProject}
          handleFindBeneficiary={handleFindBeneficiary}
          validatePhone={validatePhone}
        />
      )}
    </View>
  );
}
