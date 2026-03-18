import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { coachingApi } from '../../../src/api/coachingApi';
import { useAuthStore } from '../../../src/stores/authStore';
import { getLevelForCount, getNextLevel } from '../../../src/constants/levels';
import { formatTime } from '../../../src/utils/format';

export default function CompleteScreen() {
  const { recipeId, recipeTitle, elapsed, coachingId } = useLocalSearchParams<{
    recipeId: string;
    recipeTitle?: string;
    elapsed: string;
    coachingId: string;
  }>();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (uri: string) => {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'cooking_photo.jpg',
        type: 'image/jpeg',
      } as any);
      const res = await coachingApi.uploadPhoto(Number(coachingId), formData);
      return res.data.data.photoUrl;
    },
    onSuccess: (url) => setPhotoUrl(url),
    onError: () => Alert.alert('오류', '사진 업로드에 실패했습니다.'),
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await coachingApi.complete(Number(coachingId), {
        actualSeconds: Number(elapsed),
      });
      return res.data.data;
    },
    onSuccess: () => {
      if (user) {
        const updatedUser = { ...user, completedCookingCount: user.completedCookingCount + 1 };
        setUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ['recipe'] });
      router.replace('/(tabs)/home');
    },
    onError: () => {
      Alert.alert('오류', '완료 기록에 실패했습니다.');
      router.replace('/(tabs)/home');
    },
  });

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      uploadMutation.mutate(uri);
    }
  };

  const handleDone = () => {
    completeMutation.mutate();
  };

  const count = (user?.completedCookingCount ?? 0) + 1;
  const level = getLevelForCount(count);
  const prevLevel = getLevelForCount(count - 1);
  const leveledUp = level.level > prevLevel.level;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.congrats}>🎉</Text>
        <Text style={styles.title}>요리 완성!</Text>
        <Text style={styles.time}>소요 시간: {formatTime(Number(elapsed))}</Text>

        {leveledUp && (
          <View style={styles.levelUpCard}>
            <Text style={styles.levelUpEmoji}>{level.emoji}</Text>
            <Text style={styles.levelUpTitle}>레벨 업!</Text>
            <Text style={styles.levelUpText}>
              Lv.{level.level} {level.title}
            </Text>
          </View>
        )}

        <View style={styles.photoSection}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <Button
              title="📷 완성 사진 촬영"
              onPress={handlePickPhoto}
              variant="outline"
              size="large"
              style={styles.photoBtn}
            />
          )}
          <Text style={styles.photoHint}>
            완성 사진을 업로드하면 등급에 반영돼요
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="완료"
          onPress={handleDone}
          loading={completeMutation.isPending}
          size="large"
          style={styles.doneBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 16,
  },
  congrats: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  time: { fontSize: 16, color: Colors.textSecondary },
  levelUpCard: {
    alignItems: 'center', backgroundColor: '#FFF5F0',
    padding: 24, borderRadius: 20, gap: 8, width: '100%',
  },
  levelUpEmoji: { fontSize: 48 },
  levelUpTitle: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  levelUpText: { fontSize: 16, color: Colors.text },
  photoSection: { alignItems: 'center', gap: 8, marginTop: 8 },
  photo: { width: 150, height: 150, borderRadius: 16 },
  photoBtn: { width: 220 },
  photoHint: { fontSize: 13, color: Colors.textTertiary },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  doneBtn: { width: '100%' },
});
