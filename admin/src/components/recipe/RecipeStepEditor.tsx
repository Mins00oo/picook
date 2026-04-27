import { Button, Input, Space, Card } from 'antd';
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
          <FormField label="이미지 URL" style={{ marginBottom: 12 }}>
            <Controller
              name={`steps.${index}.imageUrl`}
              control={control}
              render={({ field: f }) => (
                <Input {...f} value={f.value ?? ''} placeholder="https://..." style={{ width: 250 }} />
              )}
            />
          </FormField>
        </Card>
      ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => append({ description: '', imageUrl: '' })}
      >
        단계 추가
      </Button>
    </div>
  );
}
