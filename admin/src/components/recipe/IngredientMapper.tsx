import { Button, InputNumber, Input, Select, Checkbox, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Controller, type Control, type UseFieldArrayReturn, type FieldErrors } from 'react-hook-form';
import { getIngredients } from '@/api/ingredientApi';
import FormField from '@/components/common/FormField';
import type { RecipeFormValues } from '@/schemas/recipeSchema';

interface Props {
  fields: UseFieldArrayReturn<RecipeFormValues, 'ingredients'>['fields'];
  control: Control<RecipeFormValues>;
  append: UseFieldArrayReturn<RecipeFormValues, 'ingredients'>['append'];
  remove: UseFieldArrayReturn<RecipeFormValues, 'ingredients'>['remove'];
  errors: FieldErrors<RecipeFormValues>;
}

export default function IngredientMapper({ fields, control, append, remove, errors }: Props) {
  const { data } = useQuery({
    queryKey: ['ingredients-all'],
    queryFn: () => getIngredients({ size: 1000 }),
  });

  const ingredientOptions =
    data?.content?.map((ing) => ({
      label: ing.name,
      value: ing.id,
    })) ?? [];

  return (
    <div>
      {fields.map((field, index) => (
        <Space key={field.id} align="start" style={{ display: 'flex', marginBottom: 8 }}>
          <FormField error={errors.ingredients?.[index]?.ingredientId?.message} style={{ marginBottom: 0 }}>
            <Controller
              name={`ingredients.${index}.ingredientId`}
              control={control}
              render={({ field: f }) => (
                <Select
                  {...f}
                  showSearch
                  placeholder="재료 검색"
                  options={ingredientOptions}
                  filterOption={(input, option) =>
                    (option?.label as string)?.includes(input)
                  }
                  style={{ width: 160 }}
                  status={errors.ingredients?.[index]?.ingredientId ? 'error' : undefined}
                />
              )}
            />
          </FormField>
          <Controller
            name={`ingredients.${index}.amount`}
            control={control}
            render={({ field: f }) => (
              <InputNumber
                {...f}
                value={f.value ?? undefined}
                onChange={(v) => f.onChange(v)}
                placeholder="수량"
                min={0}
                style={{ width: 80 }}
              />
            )}
          />
          <Controller
            name={`ingredients.${index}.unit`}
            control={control}
            render={({ field: f }) => (
              <Input {...f} value={f.value ?? ''} placeholder="단위" style={{ width: 80 }} />
            )}
          />
          <Controller
            name={`ingredients.${index}.isRequired`}
            control={control}
            render={({ field: f }) => (
              <Checkbox
                checked={f.value ?? true}
                onChange={(e) => f.onChange(e.target.checked)}
              >
                필수
              </Checkbox>
            )}
          />
          <Button danger icon={<DeleteOutlined />} onClick={() => remove(index)} />
        </Space>
      ))}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => append({ ingredientId: undefined as unknown as number, amount: undefined, unit: '', isRequired: true })}
      >
        재료 추가
      </Button>
    </div>
  );
}
