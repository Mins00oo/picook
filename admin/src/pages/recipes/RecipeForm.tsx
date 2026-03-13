import { useEffect } from 'react';
import { Button, Card, Form, Input, InputNumber, Select, Space, message, Alert } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getRecipe, createRecipe, updateRecipe } from '@/api/recipeApi';
import RecipeStepEditor from '@/components/recipe/RecipeStepEditor';
import IngredientMapper from '@/components/recipe/IngredientMapper';
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
  const [form] = Form.useForm();

  const { data: recipe } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => getRecipe(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (recipe) {
      form.setFieldsValue({
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
          stepType: step.stepType,
          durationSeconds: step.durationSeconds || undefined,
          canParallel: step.canParallel,
          imageUrl: step.imageUrl,
        })),
      });
    }
  }, [recipe, form]);

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

  const handleSave = (status: string) => {
    form.validateFields().then((values) => {
      const request: AdminRecipeRequest = {
        ...values,
        steps: values.steps?.map((step: Record<string, unknown>, i: number) => ({
          ...step,
          stepNumber: i + 1,
          canParallel: step.canParallel ?? false,
        })) ?? [],
        ingredients: values.ingredients?.map((ing: Record<string, unknown>, i: number) => ({
          ...ing,
          isRequired: ing.isRequired ?? true,
          sortOrder: i + 1,
        })) ?? [],
      };

      if (status === 'draft') {
        saveMutation.mutate(request);
      } else {
        saveMutation.mutate(request);
      }
    });
  };

  const hasStepsWithoutDuration = Form.useWatch('steps', form)?.some(
    (s: { durationSeconds?: number }) => !s?.durationSeconds,
  );

  return (
    <div>
      <h2>{isEdit ? '레시피 수정' : '레시피 등록'}</h2>
      {hasStepsWithoutDuration && (
        <Alert
          type="warning"
          message="일부 조리 단계에 소요시간이 입력되지 않았습니다. 이 경우 코칭 준비 상태가 미완료로 설정됩니다."
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}
      <Form form={form} layout="vertical">
        <Card title="기본 정보" style={{ marginBottom: 16 }}>
          <Form.Item name="title" label="요리명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space wrap>
            <Form.Item name="category" label="카테고리" rules={[{ required: true }]}>
              <Select options={CATEGORY_OPTIONS} style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="difficulty" label="난이도" rules={[{ required: true }]}>
              <Select options={DIFFICULTY_OPTIONS} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="cookingTimeMinutes" label="조리시간(분)" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item name="servings" label="인분">
              <InputNumber min={1} />
            </Form.Item>
          </Space>
          <Form.Item name="imageUrl" label="대표 이미지 URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="thumbnailUrl" label="썸네일 URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="tips" label="팁">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Card>

        <Card title="재료" style={{ marginBottom: 16 }}>
          <IngredientMapper />
        </Card>

        <Card title="조리 순서" style={{ marginBottom: 16 }}>
          <RecipeStepEditor />
        </Card>

        <Space>
          <Button onClick={() => handleSave('draft')} loading={saveMutation.isPending}>
            임시저장
          </Button>
          <Button type="primary" onClick={() => handleSave('published')} loading={saveMutation.isPending}>
            저장 + 공개
          </Button>
          <Button onClick={() => navigate('/recipes')}>취소</Button>
        </Space>
      </Form>
    </div>
  );
}
