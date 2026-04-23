import { useEffect } from 'react';
import { Button, Card, Input, InputNumber, Select, Space, Switch, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOutfit, getOutfits, updateOutfit } from '@/api/outfitApi';
import FormField from '@/components/common/FormField';
import { outfitSchema, SLOT_OPTIONS, type OutfitFormValues } from '@/schemas/outfitSchema';
import type { AdminOutfitRequest } from '@/types/outfit';

export default function OutfitForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<OutfitFormValues>({
    resolver: zodResolver(outfitSchema),
    defaultValues: {
      slot: 'top',
      name: '',
      description: '',
      imageUrl: '',
      pricePoints: 0,
      unlockLevel: null,
      isDefault: false,
      isActive: true,
      sortOrder: 0,
    },
  });

  const { data: listData } = useQuery({
    queryKey: ['admin-outfits'],
    queryFn: getOutfits,
    enabled: isEdit,
  });

  useEffect(() => {
    if (!isEdit || !listData) return;
    const found = listData.find((o) => o.id === Number(id));
    if (!found) return;
    reset({
      slot: found.slot,
      name: found.name,
      description: found.description ?? '',
      imageUrl: found.imageUrl,
      pricePoints: found.pricePoints,
      unlockLevel: found.unlockLevel ?? null,
      isDefault: found.isDefault,
      isActive: found.isActive,
      sortOrder: found.sortOrder,
    });
  }, [isEdit, listData, id, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: AdminOutfitRequest) =>
      isEdit ? updateOutfit(Number(id), data) : createOutfit(data),
    onSuccess: () => {
      message.success(isEdit ? '수정되었습니다.' : '등록되었습니다.');
      navigate('/outfits');
    },
    onError: (err: { message?: string }) => {
      message.error(err?.message ?? '저장에 실패했습니다.');
    },
  });

  const onSubmit = (values: OutfitFormValues) => {
    saveMutation.mutate({
      slot: values.slot,
      name: values.name,
      description: values.description ?? undefined,
      imageUrl: values.imageUrl,
      pricePoints: values.pricePoints,
      unlockLevel: values.unlockLevel ?? null,
      isDefault: values.isDefault ?? false,
      isActive: values.isActive ?? true,
      sortOrder: values.sortOrder ?? 0,
    });
  };

  return (
    <div>
      <h2>{isEdit ? '의상 수정' : '의상 등록'}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card title="기본 정보" style={{ marginBottom: 16 }}>
          <Space wrap>
            <FormField label="슬롯" error={errors.slot?.message} required>
              <Controller
                name="slot"
                control={control}
                render={({ field }) => (
                  <Select {...field} options={[...SLOT_OPTIONS]} style={{ width: 180 }} />
                )}
              />
            </FormField>
            <FormField label="이름" error={errors.name?.message} required>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} style={{ width: 220 }} />}
              />
            </FormField>
            <FormField label="정렬순">
              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    value={field.value ?? 0}
                    onChange={(v) => field.onChange(v ?? 0)}
                    min={0}
                  />
                )}
              />
            </FormField>
          </Space>

          <FormField label="설명">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} value={field.value ?? ''} rows={2} />
              )}
            />
          </FormField>

          <FormField label="이미지 URL" error={errors.imageUrl?.message} required>
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => <Input {...field} placeholder="/outfits/xxx.png" />}
            />
          </FormField>
        </Card>

        <Card title="가격 · 해금 · 지급" style={{ marginBottom: 16 }}>
          <Space wrap>
            <FormField label="가격 (포인트)" error={errors.pricePoints?.message}>
              <Controller
                name="pricePoints"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    value={field.value ?? 0}
                    onChange={(v) => field.onChange(v ?? 0)}
                    min={0}
                    addonAfter="P"
                  />
                )}
              />
            </FormField>

            <FormField label="해금 레벨" error={errors.unlockLevel?.message}>
              <Controller
                name="unlockLevel"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    value={field.value ?? undefined}
                    onChange={(v) => field.onChange(v ?? null)}
                    min={1}
                    max={7}
                    placeholder="선택"
                  />
                )}
              />
            </FormField>

            <FormField label="기본 지급">
              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <Switch checked={!!field.value} onChange={field.onChange} />
                )}
              />
            </FormField>

            <FormField label="활성">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value ?? true} onChange={field.onChange} />
                )}
              />
            </FormField>
          </Space>
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
            저장
          </Button>
          <Button onClick={() => navigate('/outfits')}>취소</Button>
        </Space>
      </form>
    </div>
  );
}
