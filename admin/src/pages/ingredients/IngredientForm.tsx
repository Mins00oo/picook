import { useEffect, useState } from 'react';
import { Button, Card, Input, Select, Space, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getIngredient, createIngredient, updateIngredient } from '@/api/ingredientApi';
import { getCategories } from '@/api/categoryApi';
import { getSubcategories } from '@/api/subcategoryApi';
import { ingredientSchema, type IngredientFormValues } from '@/schemas/ingredientSchema';
import FormField from '@/components/common/FormField';
import type { AdminIngredientRequest } from '@/types/ingredient';

const DEFAULT_VALUES: IngredientFormValues = {
  name: '',
  categoryId: undefined as unknown as number,
  subcategoryId: null,
  emoji: '',
  iconUrl: '',
  synonyms: [],
};

export default function IngredientForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [continueMode, setContinueMode] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const selectedCategoryId = watch('categoryId');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', selectedCategoryId],
    queryFn: () => getSubcategories(selectedCategoryId),
    enabled: !!selectedCategoryId,
  });

  const { data: ingredient } = useQuery({
    queryKey: ['ingredient', id],
    queryFn: () => getIngredient(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (ingredient) {
      reset({
        name: ingredient.name,
        categoryId: ingredient.categoryId,
        subcategoryId: ingredient.subcategoryId ?? null,
        emoji: ingredient.emoji ?? '',
        iconUrl: ingredient.iconUrl ?? '',
        synonyms: ingredient.synonyms,
      });
    }
  }, [ingredient, reset]);

  // 카테고리 변경 시 서브카테고리 리셋 (편집 모드 초기 렌더 제외)
  useEffect(() => {
    if (!isEdit) return;
    if (!ingredient) return;
    if (selectedCategoryId !== ingredient.categoryId) {
      setValue('subcategoryId', null);
    }
  }, [selectedCategoryId, ingredient, isEdit, setValue]);

  const saveMutation = useMutation({
    mutationFn: (data: AdminIngredientRequest) =>
      isEdit ? updateIngredient(Number(id), data) : createIngredient(data),
    onSuccess: () => {
      message.success(isEdit ? '수정되었습니다.' : '등록되었습니다.');
      if (!isEdit && continueMode) {
        const keep = {
          categoryId: getValues('categoryId'),
          subcategoryId: getValues('subcategoryId') ?? null,
        };
        reset({ ...DEFAULT_VALUES, ...keep });
        setContinueMode(false);
      } else {
        navigate('/ingredients');
      }
    },
    onError: (err: { message?: string }) => {
      setContinueMode(false);
      message.error(err?.message ?? '저장에 실패했습니다.');
    },
  });

  const buildPayload = (values: IngredientFormValues): AdminIngredientRequest => ({
    name: values.name,
    categoryId: values.categoryId,
    subcategoryId: values.subcategoryId ?? null,
    emoji: values.emoji ? values.emoji : undefined,
    iconUrl: values.iconUrl || undefined,
    synonyms: values.synonyms ?? [],
  });

  const onSubmit = (values: IngredientFormValues) => {
    saveMutation.mutate(buildPayload(values));
  };

  const onSubmitContinue = handleSubmit((values) => {
    setContinueMode(true);
    saveMutation.mutate(buildPayload(values));
  });

  return (
    <div>
      <h2>{isEdit ? '재료 수정' : '재료 등록'}</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 560 }}>
          <FormField label="재료명" error={errors.name?.message} required>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} status={errors.name ? 'error' : undefined} />
              )}
            />
          </FormField>
          <FormField label="카테고리" error={errors.categoryId?.message} required>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  options={
                    categories?.map((c) => ({
                      value: c.id,
                      label: `${c.emoji ? c.emoji + ' ' : ''}${c.name}`,
                    })) ?? []
                  }
                  placeholder="카테고리 선택"
                  status={errors.categoryId ? 'error' : undefined}
                  style={{ width: 260 }}
                />
              )}
            />
          </FormField>
          <FormField label="서브카테고리" error={errors.subcategoryId?.message}>
            <Controller
              name="subcategoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onChange={(v) => field.onChange(v ?? null)}
                  allowClear
                  placeholder={
                    selectedCategoryId
                      ? subcategories && subcategories.length > 0
                        ? '서브카테고리 선택'
                        : '해당 카테고리에 서브카테고리가 없습니다'
                      : '카테고리 먼저 선택'
                  }
                  options={
                    subcategories?.map((s) => ({
                      value: s.id,
                      label: `${s.emoji ? s.emoji + ' ' : ''}${s.name}`,
                    })) ?? []
                  }
                  disabled={!selectedCategoryId || !subcategories?.length}
                  style={{ width: 260 }}
                />
              )}
            />
          </FormField>
          <FormField label="이모지" error={errors.emoji?.message}>
            <Controller
              name="emoji"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ''}
                  maxLength={8}
                  placeholder="예: 🥕 (미입력 시 서브/대카테고리 이모지 사용)"
                  style={{ width: 320 }}
                />
              )}
            />
          </FormField>
          <FormField label="아이콘 URL">
            <Controller
              name="iconUrl"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ''} placeholder="https://..." />
              )}
            />
          </FormField>
          <FormField label="동의어">
            <Controller
              name="synonyms"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  mode="tags"
                  placeholder="동의어 입력 후 Enter"
                  value={field.value ?? []}
                />
              )}
            />
          </FormField>
          <Space>
            <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
              저장
            </Button>
            {!isEdit && (
              <Button onClick={onSubmitContinue} loading={saveMutation.isPending}>
                저장 후 계속 등록
              </Button>
            )}
            <Button onClick={() => navigate('/ingredients')}>취소</Button>
          </Space>
        </form>
      </Card>
    </div>
  );
}
