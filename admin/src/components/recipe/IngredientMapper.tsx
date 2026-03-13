import { Button, Form, Input, InputNumber, Select, Checkbox, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getIngredients } from '@/api/ingredientApi';

export default function IngredientMapper() {
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
    <Form.List name="ingredients">
      {(fields, { add, remove }) => (
        <>
          {fields.map((field) => (
            <Space key={field.key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
              <Form.Item
                {...field}
                name={[field.name, 'ingredientId']}
                rules={[{ required: true, message: '재료 선택' }]}
              >
                <Select
                  showSearch
                  placeholder="재료 검색"
                  options={ingredientOptions}
                  filterOption={(input, option) =>
                    (option?.label as string)?.includes(input)
                  }
                  style={{ width: 160 }}
                />
              </Form.Item>
              <Form.Item {...field} name={[field.name, 'amount']}>
                <InputNumber placeholder="수량" min={0} style={{ width: 80 }} />
              </Form.Item>
              <Form.Item {...field} name={[field.name, 'unit']}>
                <Input placeholder="단위" style={{ width: 80 }} />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, 'isRequired']}
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>필수</Checkbox>
              </Form.Item>
              <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
            </Space>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
            재료 추가
          </Button>
        </>
      )}
    </Form.List>
  );
}
