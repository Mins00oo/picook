import { useEffect } from 'react';
import { Button, Card, Form, Input, Select, Space, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getIngredient, createIngredient, updateIngredient } from '@/api/ingredientApi';
import { getCategories } from '@/api/categoryApi';
import type { AdminIngredientRequest } from '@/types/ingredient';

export default function IngredientForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();

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
      form.setFieldsValue({
        name: ingredient.name,
        categoryId: ingredient.categoryId,
        iconUrl: ingredient.iconUrl,
        synonyms: ingredient.synonyms,
      });
    }
  }, [ingredient, form]);

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

  const handleFinish = (values: AdminIngredientRequest) => {
    saveMutation.mutate(values);
  };

  return (
    <div>
      <h2>{isEdit ? '재료 수정' : '재료 등록'}</h2>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ maxWidth: 500 }}>
          <Form.Item name="name" label="재료명" rules={[{ required: true, message: '재료명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="카테고리" rules={[{ required: true, message: '카테고리를 선택하세요' }]}>
            <Select
              options={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
              placeholder="카테고리 선택"
            />
          </Form.Item>
          <Form.Item name="iconUrl" label="아이콘 URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="synonyms" label="동의어">
            <Select mode="tags" placeholder="동의어 입력 후 Enter" />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
              저장
            </Button>
            <Button onClick={() => navigate('/ingredients')}>취소</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
