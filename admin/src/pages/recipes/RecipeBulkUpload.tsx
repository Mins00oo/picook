import { useState } from 'react';
import { Button, Card, Upload, Table, Alert, Space, Typography, message } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { bulkUploadRecipes, downloadRecipeTemplate } from '@/api/recipeApi';
import type { RecipeBulkUploadResponse } from '@/types/recipe';

export default function RecipeBulkUpload() {
  const [result, setResult] = useState<RecipeBulkUploadResponse | null>(null);

  const uploadMutation = useMutation({
    mutationFn: bulkUploadRecipes,
    onSuccess: (data) => {
      setResult(data);
      if (data.failed === 0) {
        message.success(`${data.success}건 모두 등록되었습니다.`);
      } else {
        message.warning(`성공 ${data.success}건, 실패 ${data.failed}건`);
      }
    },
    onError: (err: { message?: string }) => {
      message.error(err?.message ?? '업로드에 실패했습니다.');
    },
  });

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadRecipeTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recipe_template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('템플릿 다운로드에 실패했습니다.');
    }
  };

  return (
    <div>
      <h2>레시피 엑셀 일괄등록</h2>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
              템플릿 다운로드
            </Button>
            <Typography.Text type="secondary">
              양식에 맞춰 데이터를 입력한 후 업로드하세요.
            </Typography.Text>
          </Space>
        </Card>

        <Card>
          <Upload.Dragger
            accept=".xlsx,.xls"
            maxCount={1}
            showUploadList={false}
            customRequest={({ file }) => {
              uploadMutation.mutate(file as File);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">클릭 또는 드래그하여 엑셀 파일 업로드</p>
            <p className="ant-upload-hint">.xlsx 파일만 지원합니다.</p>
          </Upload.Dragger>
        </Card>

        {result && (
          <Card title="업로드 결과">
            <Space style={{ marginBottom: 16 }}>
              <Alert type="success" message={`성공: ${result.success}건`} />
              {result.failed > 0 && <Alert type="error" message={`실패: ${result.failed}건`} />}
              <Alert type="info" message={`전체: ${result.total}건`} />
            </Space>
            {result.errors.length > 0 && (
              <Table
                rowKey="row"
                dataSource={result.errors}
                pagination={false}
                size="small"
                columns={[
                  { title: '행', dataIndex: 'row', width: 60 },
                  { title: '오류 사유', dataIndex: 'reason' },
                ]}
              />
            )}
          </Card>
        )}
      </Space>
    </div>
  );
}
