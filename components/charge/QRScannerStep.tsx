import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Icon } from "@/components/ui/Icon";
import { PRIMARY_BLUE, TEXT_PRIMARY, TEXT_MUTED } from "./constants";

type Props = {
  onScanned: (walletAddress: string) => void;
  onClose: () => void;
  loading?: boolean;
};

export const QRScannerStep: React.FC<Props> = ({
  onScanned,
  onClose,
  loading = false,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);

    // Parse "walletAddress:0x23d26F..."
    let walletAddress = "";
    if (data.startsWith("walletAddress:")) {
      walletAddress = data.replace("walletAddress:", "").trim();
    } else if (data.startsWith("0x")) {
      // fallback: raw address
      walletAddress = data.trim();
    } else {
      Alert.alert(
        "Invalid QR Code",
        "This QR code does not contain a valid wallet address.",
        [{ text: "Try Again", onPress: () => setScanned(false) }]
      );
      return;
    }
    onScanned(walletAddress);
  };

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={PRIMARY_BLUE} />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={s.center}>
        <Icon name="camera-off" size={48} color={TEXT_MUTED} />
        <Text style={s.permTitle}>Camera Permission Required</Text>
        <Text style={s.permSub}>
          We need camera access to scan beneficiary QR codes.
        </Text>
        <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
          <Text style={s.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
          <Text style={[s.permSub, { color: PRIMARY_BLUE }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      {/* Dark overlay with cutout effect */}
      <View style={s.overlay}>
        <View style={s.overlayTop} />
        <View style={s.overlayMiddle}>
          <View style={s.overlaySide} />
          <View style={s.scanBox}>
            {/* Corner borders */}
            <View style={[s.corner, s.cornerTL]} />
            <View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} />
            <View style={[s.corner, s.cornerBR]} />
            {loading && (
              <ActivityIndicator size="large" color="#fff" />
            )}
          </View>
          <View style={s.overlaySide} />
        </View>
        <View style={s.overlayBottom}>
          <Text style={s.scanHint}>
            {scanned && loading
              ? "Processing..."
              : "Point camera at beneficiary QR code"}
          </Text>
          <View style={s.bottomBtns}>
            {scanned && !loading && (
              <TouchableOpacity
                style={s.retryBtn}
                onPress={() => setScanned(false)}
              >
                <Icon name="refresh-cw" size={16} color="#fff" />
                <Text style={s.retryText}>Scan Again</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const SCAN_BOX = 240;
const CORNER = 20;
const CORNER_THICKNESS = 3;

const s = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  permTitle: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 18,
    color: TEXT_PRIMARY,
    textAlign: "center",
  },
  permSub: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
  },
  permBtn: {
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permBtnText: {
    fontFamily: "Manrope",
    fontWeight: "700",
    fontSize: 14,
    color: "#fff",
  },
  // Overlay
  overlay: { flex: 1 },
  overlayTop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  overlayMiddle: { flexDirection: "row", height: SCAN_BOX },
  overlaySide: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  scanBox: {
    width: SCAN_BOX,
    height: SCAN_BOX,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: 24,
    gap: 20,
  },
  scanHint: {
    fontFamily: "Manrope",
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  bottomBtns: { flexDirection: "row", gap: 12 },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    fontFamily: "Manrope",
    fontWeight: "600",
    fontSize: 14,
    color: "#fff",
  },
  closeBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  closeBtnText: {
    fontFamily: "Manrope",
    fontWeight: "600",
    fontSize: 14,
    color: "#fff",
  },
  // Corners
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#fff",
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
  },
});