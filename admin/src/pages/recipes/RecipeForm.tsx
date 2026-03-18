import { useEffect } from 'react';
import { Button, Card, Input, InputNumber, Select, Space, message, Alert } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRecipe, createRecipe, updateRecipe } from '@/api/recipeApi';
import RecipeStepEditor from '@/components/recipe/RecipeStepEditor';
import IngredientMapper from '@/components/recipe/IngredientMapper';
import { recipeSchema, type RecipeFormValues } from '@/schemas/recipeSchema';
import FormField from '@/components/common/FormField';
import type { AdminRecipeRequest } from '@/types/recipe';

const CATEGORY_OPTIONS = [
  { value: 'korean', label: '한식' },
  { value: 'western', label: '양식' },
  { value: 'chinese', label: '중식' },
  { value: 'japanese', label: '일식' },
  { value: 'snack', label: '분식' },
  { value: 'dessert', label: '디저트' },
  { value: 'drink', label: '음료' },
  { value: 'other', label: '기타' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '쉬움' },
  { value: 'medium', label: '보통' },
  { value: 'hard', label: '어려움' },
];

export default function RecipeForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      category: '',
      difficulty: '',
      cookingTimeMinutes: undefined as unknown as number,
      servings: undefined,
      imageUrl: '',
      thumbnailUrl: '',
      tips: '',
      steps: [],
      ingredients: [],
    },
  });

  const stepsArray = useFieldArray({ control, name: 'steps' });
  const ingredientsArray = useFieldArray({ control, name: 'ingredients' });

  const { data: recipe } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => getRecipe(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (recipe) {
      reset({
        title: recipe.title,
        category: recipe.category,
        difficulty: recipe.difficulty,
        cookingTimeMinutes: recipe.cookingTimeMinutes,
        servings: recipe.servings,
        imageUrl: recipe.imageUrl,
        thumbnailUrl: recipe.thumbnailUrl,
        tips: recipe.tips,
        ingredients: recipe.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          amount: ing.amount,
          unit: ing.unit,
          isRequired: ing.isRequired,
        })),
        steps: recipe.steps.map((step) => ({
          description: step.description,
          stepType: step.stepType as 'active' | 'wait',
          durationSeconds: step.durationSeconds || undefined,
          canParallel: step.canParallel,
          imageUrl: step.imageUrl,
        })),
      });
    }
  }, [recipe, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: AdminRecipeRequest) =>
      isEdit ? updateRecipe(Number(id), data) : createRecipe(data),
    onSuccess: () => {
      message.success(isEdit ? '수정되었습니다.' : '등록되었습니다.');
      navigate('/recipes');
    },
    onError: (err: { message?: string }) => {
      message.error(err?.message ?? '저장에 실패했습니다.');
    },
  });

  const onSubmit = (values: RecipeFormValues) => {
    const request: AdminRecipeRequest = {
      ...values,
      steps: values.steps?.map((step, i) => ({
        ...step,
        stepNumber: i + 1,
        canParallel: step.canParallel ?? false,
      })) ?? [],
      ingredients: values.ingredients?.map((ing, i) => ({
        ...ing,
        isRequired: ing.isRequired ?? true,
        sortOrder: i + 1,
      })) ?? [],
    };
    saveMutation.mutate(request);
  };

  const watchedSteps = watch('steps');
  const hasStepsWithoutDuration = watchedSteps?.some((s) => !s?.durationSeconds);

  return (
    <div>
      <h2>{isEdit ? '레시피 수정' : '레시피 등록'}</h2>
      {hasStepsWithoutDuration && watchedSteps.length > 0 && (
        <Alert
          type="warning"
          message="일부 조리 단계에 소요시간이 입력되지 않았습니다. 이 경우 코칭 준비 상태가 미완료로 설정됩니다."
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card title="기본 정보" style={{ marginBottom: 16 }}>
          <FormField label="요리명" error={errors.title?.message} required>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input {...field} status={errors.title ? 'error' : undefined} />
              )}
            />
          </FormField>
          <Space wrap>
            <FormField label="카테고리" error={errors.category?.message} required>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={CATEGORY_OPTIONS}
                    style={{ width: 150 }}
                    status={errors.category ? 'error' : undefined}
                  />
                )}
              />
            </FormField>
            <FormField label="난이도" error={errors.difficulty?.message} required>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={DIFFICULTY_OPTIONS}
                    style={{ width: 120 }}
                    status={errors.difficulty ? 'error' : undefined}
                  />
                )}
              />
            </FormField>
            <FormField label="조리시간(분)" error={errors.cookingTimeMinutes?.message} required>
              <Controller
                name="cookingTimeMinutes"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    onChange={(v) => field.onChange(v)}
                    min={1}
                    status={errors.cookingTimeMinutes ? 'error' : undefined}
                  />
                )}
              />
            </FormField>
            <FormField label="인분">
              <Controller
                name="servings"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    value={field.value ?? undefined}
                    onChange={(v) => field.onChange(v)}
                    min={1}
                  />
                )}
              />
            </FormField>
          </Space>
          <FormField label="대표 이미지 URL">
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ''} placeholder="https://..." />
              )}
            />
          </FormField>
          <FormField label="썸네일 URL">
            <Controller
              name="thumbnailUrl"
              control={control}
              render={({ field }) => (
                <Input {...field} value={field.value ?? ''} placeholder="https://..." />
              )}
            />
          </FormField>
          <FormField label="팁">
            <Controller
              name="tips"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} value={field.value ?? ''} rows={3} />
              )}
            />
          </FormField>
        </Card>

        <Card title="재료" style={{ marginBottom: 16 }}>
          <IngredientMapper
            fields={ingredientsArray.fields}
            control={control}
            append={ingredientsArray.append}
            remove={ingredientsArray.remove}
            errors={errors}
          />
        </Card>

        <Card title="조리 순서" style={{ marginBottom: 16 }}>
          <RecipeStepEditor
            fields={stepsArray.fields}
            control={control}
            append={stepsArray.append}
            remove={stepsArray.remove}
            move={stepsArray.move}
            errors={errors}
          />
        </Card>

        <Space>
          <Button htmlType="submit" loading={saveMutation.isPending}>
            임시저장
          </Button>
          <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
            저장 + 공개
          </Button>
          <Button onClick={() => navigate('/recipes')}>취소</Button>
        </Space>
      </form>
    </div>
  );
}
