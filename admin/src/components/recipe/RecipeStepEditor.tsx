import { Button, Form, Input, InputNumber, Radio, Checkbox, Space, Card, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

export default function RecipeStepEditor() {
  return (
    <div>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        능동(active) = 썰기, 볶기, 섞기 &nbsp;|&nbsp; 대기(wait) = 끓이기, 익히기, 밥 짓기
      </Typography.Text>
      <Form.List name="steps">
        {(fields, { add, remove, move }) => (
          <>
            {fields.map((field, index) => (
              <Card
                key={field.key}
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
                      onClick={() => remove(field.name)}
                    />
                  </Space>
                }
              >
                <Form.Item
                  {...field}
                  name={[field.name, 'description']}
                  rules={[{ required: true, message: '설명을 입력하세요' }]}
                >
                  <Input.TextArea rows={2} placeholder="조리 설명" />
                </Form.Item>
                <Space wrap>
                  <Form.Item
                    {...field}
                    name={[field.name, 'stepType']}
                    initialValue="active"
                    label="유형"
                  >
                    <Radio.Group>
                      <Radio value="active">능동</Radio>
                      <Radio value="wait">대기</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'durationSeconds']}
                    label="소요시간(초)"
                  >
                    <InputNumber min={0} placeholder="초" />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, 'canParallel']}
                    valuePropName="checked"
                    initialValue={false}
                    label="병렬 가능"
                  >
                    <Checkbox />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'imageUrl']} label="이미지 URL">
                    <Input placeholder="https://..." style={{ width: 250 }} />
                  </Form.Item>
                </Space>
              </Card>
            ))}
            <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
              단계 추가
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
}
