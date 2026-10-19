
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/lib/auth';
import { registerAttendance } from '@/lib/attendance';
import { useAppTheme } from '@/constants/ThemeContext';

export default function ScanScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 14,
    },
    header: {
      marginBottom: 22,
    },
    eyebrow: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.6,
      marginBottom: 7,
    },
    title: {
      fontSize: 27,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 7,
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.secondaryText,
    },
    cameraCard: {
      height: 310,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: '#111827',
      position: 'relative',
    },
    camera: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    cameraOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanFrame: {
      width: 205,
      height: 205,
      alignItems: 'center',
      justifyContent: 'center',
    },
    corner: {
      position: 'absolute',
      width: 35,
      height: 35,
      borderColor: '#FFFFFF',
      borderWidth: 4,
    },
    topLeft: {
      top: 0,
      left: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: 12,
    },
    topRight: {
      top: 0,
      right: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderTopRightRadius: 12,
    },
    bottomLeft: {
      bottom: 0,
      left: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomLeftRadius: 12,
    },
    bottomRight: {
      bottom: 0,
      right: 0,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomRightRadius: 12,
    },
    scanHint: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraInstruction: {
      position: 'absolute',
      bottom: 15,
      paddingHorizontal: 15,
      paddingVertical: 9,
      backgroundColor: 'rgba(17, 24, 39, 0.78)',
      borderRadius: 12,
    },
    cameraInstructionText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    resultCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      marginTop: 18,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
    },
    idleContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
    },
    resultTextContainer: {
      flex: 1,
    },
    idleIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultContent: {
      alignItems: 'center',
    },
    resultIcon: {
      width: 58,
      height: 58,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    successIcon: {
      backgroundColor: '#E8F7EF',
    },
    errorIcon: {
      backgroundColor: '#FDECEC',
    },
    resultTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 5,
    },
    resultSubtitle: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.secondaryText,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      alignSelf: 'stretch',
      backgroundColor: colors.primary,
      borderRadius: 13,
      paddingVertical: 13,
      paddingHorizontal: 18,
      marginTop: 16,
    },
    primaryButtonText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    bottomTip: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 9,
      marginTop: 18,
      paddingHorizontal: 3,
    },
    tipText: {
      flex: 1,
      fontSize: 11,
      lineHeight: 18,
      color: colors.secondaryText,
    },
    permissionScreen: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 28,
    },
    permissionIcon: {
      width: 78,
      height: 78,
      borderRadius: 25,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    permissionTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    permissionSubtitle: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 22,
    },
  });

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    setMessage(null);

    try {
      if (!user?.id) {
        setSuccess(false);
        setMessage('Please sign in before registering attendance.');
        return;
      }

      const result = await registerAttendance(data, user.id);
      setSuccess(result.success);
      setMessage(result.message);
    } catch {
      setSuccess(false);
      setMessage('Something went wrong. Please try scanning again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setMessage(null);
    setSuccess(false);
    setLoading(false);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.permissionSubtitle}>
          Checking camera permission...
        </Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <View style={styles.permissionIcon}>
          <Ionicons
            name="camera-outline"
            size={38}
            color={colors.primary}
          />
        </View>

        <Text style={styles.permissionTitle}>
          Camera Access Needed
        </Text>

        <Text style={styles.permissionSubtitle}>
          Allow camera access so you can scan QR codes for school events
          and register your attendance.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={requestPermission}
        >
          <Ionicons name="camera" size={19} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>EVENT CHECK-IN</Text>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>
          Scan the QR code provided by your event organizer.
        </Text>
      </View>

      <View style={styles.cameraCard}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={
            scanned || loading ? undefined : handleBarcodeScanned
          }
        />

        <View pointerEvents="none" style={styles.cameraOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {!scanned && (
              <View style={styles.scanHint}>
                <Ionicons
                  name="qr-code-outline"
                  size={27}
                  color="#FFFFFF"
                />
              </View>
            )}
          </View>

          {!scanned && (
            <View style={styles.cameraInstruction}>
              <Text style={styles.cameraInstructionText}>
                Align the QR code inside the frame
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.resultCard}>
        {loading ? (
          <View style={styles.resultRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultTitle}>
                Recording attendance...
              </Text>
              <Text style={styles.resultSubtitle}>
                Please wait while we process your check-in.
              </Text>
            </View>
          </View>
        ) : scanned && message ? (
          <View style={styles.resultContent}>
            <View
              style={[
                styles.resultIcon,
                success ? styles.successIcon : styles.errorIcon,
              ]}
            >
              <Ionicons
                name={success ? 'checkmark-circle' : 'alert-circle'}
                size={27}
                color={success ? '#218653' : '#C62828'}
              />
            </View>

            <Text style={styles.resultTitle}>
              {success ? 'Attendance Recorded!' : 'Unable to Check In'}
            </Text>

            <Text style={styles.resultSubtitle}>{message}</Text>

            <Pressable
              style={styles.primaryButton}
              onPress={handleScanAgain}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Scan Again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.idleContent}>
            <View style={styles.idleIcon}>
              <Ionicons
                name="scan-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            <View style={styles.resultTextContainer}>
              <Text style={styles.resultTitle}>Ready to scan</Text>
              <Text style={styles.resultSubtitle}>
                Your attendance will be recorded after a valid event QR
                code is scanned.
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.bottomTip}>
        <Ionicons
          name="information-circle-outline"
          size={19}
          color={colors.primary}
        />
        <Text style={styles.tipText}>
          Make sure the QR code is clear and your camera has enough light.
        </Text>
      </View>
    </SafeAreaView>
  );
}
