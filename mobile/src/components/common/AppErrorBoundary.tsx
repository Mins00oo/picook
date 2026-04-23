import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fontFamily, shadow } from '../../constants/theme';
import { captureException } from '../../lib/errorReporting';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * 런타임 에러 시 화이트 스크린 크래시 방지.
 * 어느 하위 화면에서 undefined 접근이나 예외가 나더라도 사용자는
 * 여기서 "다시 시도"를 눌러 React 트리를 복구할 수 있다.
 *
 * TODO: Sentry 연동 시 captureException 추가.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 에러 리포터(Sentry placeholder)로 전송. 실제 연동 시 DSN만 주입하면 자동으로 Sentry 전송.
    captureException(error, { componentStack: info.componentStack });
  }

  retry = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text style={styles.emoji}>😵</Text>
        <Text style={styles.title}>앗, 뭔가 잘못됐어요</Text>
        <Text style={styles.desc}>
          일시적인 문제가 발생했어요.{'\n'}
          잠시 후 다시 시도해주세요.
        </Text>
        {__DEV__ && this.state.message && (
          <Text style={styles.dev} numberOfLines={4}>{this.state.message}</Text>
        )}
        <TouchableOpacity style={styles.btn} onPress={this.retry} activeOpacity={0.85}>
          <Text style={styles.btnText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emoji: { fontSize: 54, marginBottom: 6 },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  desc: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  dev: {
    fontFamily: fontFamily.regular,
    fontSize: 10.5,
    color: colors.error,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 15,
  },
  btn: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 100,
    backgroundColor: colors.primary,
    ...shadow.cta,
  },
  btnText: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: '#fff',
    letterSpacing: -0.2,
  },
});
