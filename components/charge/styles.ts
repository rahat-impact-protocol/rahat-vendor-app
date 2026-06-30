import { StyleSheet } from 'react-native';
import {
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER_COLOR,
  ERROR_COLOR,
} from './constants';

export const shared = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SURFACE },
  scrollPad: { padding: 20, paddingBottom: 40 },
  centeredContent: { alignItems: 'center' as const },
  whiteSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 24,
  },
  stepTitle: {
    fontFamily: 'Manrope',
    fontWeight: '800' as const,
    fontSize: 20,
    color: TEXT_PRIMARY,
    marginBottom: 6,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  stepSub: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 24,
  },

  fieldLabel: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700' as const,
    color: TEXT_MUTED,
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  fieldError: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: ERROR_COLOR,
    marginTop: 5,
  },

  cancelBtn: { alignSelf: 'center' as const, paddingVertical: 16 },
  cancelText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500' as const,
  },

  stateIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEE2E2',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 16,
    marginBottom: 20,
  },
  stateIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  stateTitle: {
    fontFamily: 'Manrope',
    fontWeight: '800' as const,
    fontSize: 20,
    color: TEXT_PRIMARY,
    textAlign: 'center' as const,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  stateSub: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center' as const,
    lineHeight: 21,
    paddingHorizontal: 8,
  },

  detailCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});
