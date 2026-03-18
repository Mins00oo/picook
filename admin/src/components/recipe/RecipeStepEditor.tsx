import { Button, Input, InputNumber, Radio, Checkbox, Space, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Controller, type Control, type UseFieldArrayReturn, type FieldErrors } from 'react-hook-form';
import FormField from '@/components/common/FormField';
import type { RecipeFormValues } from '@/schemas/recipeSchema';

interface Props {
  fields: UseFieldArrayReturn<RecipeFormValues, 'steps'>['fields'];
  control: Control<RecipeFormValues>;
  append: UseFieldArrayReturn<RecipeFormValues, 'steps'>['append'];
  remove: UseFieldArrayReturn<RecipeFormValues, 'steps'>['remove'];
  move: UseFieldArrayReturn<RecipeFormValues, 'steps'>['move'];
  errors: FieldErrors<RecipeFormValues>;
}

export default function RecipeStepEditor({ fields, control, append, remove, move, errors }: Props) {
  return (
    <div>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        능동(active) = 썰기, 볶기, 섞기 &nbsp;|&nbsp; 대기(wait) = 끓이기, 익히기, 밥 짓기
      </Typography.Text>
      {fields.map((field, index) => (
        <Card
          key={field.id}
          size="small"
          style={{ marginBottom: 12 }}
          title={`${index + 1}단계`}
          extra={
            <Space>
              <Button
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              />
              <Button
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
              />
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => remove(index)}
              />
            </Space>
          }
        >
          <FormField error={errors.steps?.[index]?.description?.message}>
            <Controller
              name={`steps.${index}.description`}
              control={control}
              render={({ field: f }) => (
                <Input.TextArea
                  {...f}
                  rows={2}
                  placeholder="조리 설명"
                  status={errors.steps?.[index]?.description ? 'error' : undefined}
                />
              )}
            />
          </FormField>
          <Space wrap>
            <FormField label="유형" style={{ marginBottom: 12 }}>
              <Controller
                name={`steps.${index}.stepType`}
                control={control}
                render={({ field: f }) => (
                  <Radio.Group {...f} value={f.value ?? 'active'}>
                    <Radio value="active">능동</Radio>
                    <Radio value="wait">대기</Radio>
                  </Radio.Group>
                )}
              />
            </FormField>
            <FormField label="소요시간(초)" style={{ marginBottom: 12 }}>
              <Controller
                name={`steps.${index}.durationSeconds`}
                control={control}
                render={({ field: f }) => (
                  <InputNumber
                    {...f}
                    value={f.value ?? undefined}
                    onChange={(v) => f.onChange(v)}
                    min={0}
                    placeholder="초"
                  />
                )}
              />
            </FormField>
            <FormField label="병렬 가능" style={{ marginBottom: 12 }}>
              <Controller
                name={`steps.${index}.canParallel`}
                control={control}
                render={({ field: f }) => (
                  <Checkbox
                    checked={f.value ?? false}
                    onChange={(e) => f.onChange(e.target.checked)}
                  />
                )}
              />
            </FormField>
            <FormField label="이미지 URL" style={{ marginBottom: 12 }}>
              <Controller
                name={`steps.${index}.imageUrl`}
                control={control}
                render={({ field: f }) => (
                  <Input {...f} value={f.value ?? ''} placeholder="https://..." style={{ width: 250 }} />
                )}
              />
            </FormField>
          </Space>
        </Card>
      ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => append({ description: '', stepType: 'active', durationSeconds: undefined, canParallel: false, imageUrl: '' })}
      >
        단계 추가
      </Button>
    </div>
  );
}
