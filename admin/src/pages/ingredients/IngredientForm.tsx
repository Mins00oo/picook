import { useEffect } from 'react';
import { Button, Card, Input, Select, Space, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getIngredient, createIngredient, updateIngredient } from '@/api/ingredientApi';
import { getCategories } from '@/api/categoryApi';
import { ingredientSchema, type IngredientFormValues } from '@/schemas/ingredientSchema';
import FormField from '@/components/common/FormField';
import type { AdminIngredientRequest } from '@/types/ingredient';

export default function IngredientForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: { name: '', iconUrl: '', synonyms: [] },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
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
        iconUrl: ingredient.iconUrl,
        synonyms: ingredient.synonyms,
      });
    }
  }, [ingredient, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: AdminIngredientRequest) =>
      isEdit ? updateIngredient(Number(id), data) : createIngredient(data),
    onSuccess: () => {
      message.success(isEdit ? '수정되었습니다.' : '등록되었습니다.');
      navigate('/ingredients');
    },
    onError: (err: { message?: string }) => {
      message.error(err?.message ?? '저장에 실패했습니다.');
    },
  });

  const onSubmit = (values: IngredientFormValues) => {
    saveMutation.mutate(values as AdminIngredientRequest);
  };

  return (
    <div>
      <h2>{isEdit ? '재료 수정' : '재료 등록'}</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 500 }}>
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
                  {...field}
                  options={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
                  placeholder="카테고리 선택"
                  status={errors.categoryId ? 'error' : undefined}
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
            <Button onClick={() => navigate('/ingredients')}>취소</Button>
          </Space>
        </form>
      </Card>
    </div>
  );
}
