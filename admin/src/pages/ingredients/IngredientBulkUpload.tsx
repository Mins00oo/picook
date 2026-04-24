import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Select,
  Space,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import {
  bulkUploadIngredients,
  downloadIngredientTemplate,
  exportIngredients,
} from '@/api/ingredientApi';
import { getCategories } from '@/api/categoryApi';
import type { IngredientBulkUploadResponse } from '@/types/ingredient';

const COLUMN_GUIDE = [
  { key: 'name', column: '재료명 (A)', required: '필수', example: '당근' },
  { key: 'category', column: '카테고리명 (B)', required: '필수', example: '채소' },
  { key: 'sub', column: '서브카테고리명 (C)', required: '선택', example: '뿌리채소' },
  { key: 'emoji', column: '이모지 (D)', required: '선택', example: '🥕' },
  {
    key: 'syn',
    column: '동의어 (E)',
    required: '선택',
    example: '홍당무,캐럿 (쉼표로 구분)',
  },
];

export default function IngredientBulkUpload() {
  const [result, setResult] = useState<IngredientBulkUploadResponse | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [exportCategoryId, setExportCategoryId] = useState<number | undefined>();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, dry }: { file: File; dry: boolean }) =>
      bulkUploadIngredients(file, dry),
    onSuccess: (data) => {
      setResult(data);
      if (data.failed === 0) {
        message.success(
          dryRun
            ? `검증 통과: ${data.success}건 (실제 저장은 아직 안 됨)`
            : `${data.success}건 모두 등록되었습니다.`,
        );
      } else {
        message.warning(`성공 ${data.success}건 / 실패 ${data.failed}건`);
      }
    },
    onError: (err: { message?: string }) => {
      message.error(err?.message ?? '업로드에 실패했습니다.');
    },
  });

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadIngredientTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ingredient_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('템플릿 다운로드에 실패했습니다.');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportIngredients({ categoryId: exportCategoryId });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ingredients-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('엑셀 내보내기에 실패했습니다.');
    }
  };

  const handleUpload = () => {
    if (!pendingFile) {
      message.warning('파일을 선택하세요.');
      return;
    }
    uploadMutation.mutate({ file: pendingFile, dry: dryRun });
  };

  const handleDownloadErrors = () => {
    if (!result?.errors.length) return;
    const ws = XLSX.utils.json_to_sheet(
      result.errors.map((e) => ({ 행: e.row, 사유: e.reason })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '실패 내역');
    XLSX.writeFile(wb, `ingredient-upload-errors-${Date.now()}.xlsx`);
  };

  const fileList: UploadFile[] = pendingFile
    ? [
        {
          uid: '-1',
          name: pendingFile.name,
          status: 'done',
          size: pendingFile.size,
        } as UploadFile,
      ]
    : [];

  const categoryOptions =
    categories?.map((c) => ({
      value: c.id,
      label: `${c.emoji ? c.emoji + ' ' : ''}${c.name}`,
    })) ?? [];

  return (
    <div>
      <h2>재료 엑셀 일괄등록</h2>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="1. 빈 템플릿 다운로드">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Paragraph>
              아래 5개 컬럼 구조의 엑셀 파일에 데이터를 입력하고 업로드하세요.
            </Typography.Paragraph>
            <Table
              size="small"
              pagination={false}
              rowKey="key"
              dataSource={COLUMN_GUIDE}
              columns={[
                { title: '컬럼', dataIndex: 'column', width: 180 },
                { title: '필수 여부', dataIndex: 'required', width: 100 },
                { title: '예시', dataIndex: 'example' },
              ]}
            />
            <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
              빈 템플릿 다운로드
            </Button>
          </Space>
        </Card>

        <Card title="2. 현재 데이터 내보내기">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text type="secondary">
              기존 등록 재료를 엑셀로 받아 수정 후 재업로드할 수 있습니다. 대량 수정에
              유용합니다.
            </Typography.Text>
            <Space>
              <Select
                placeholder="카테고리 필터 (선택)"
                options={categoryOptions}
                value={exportCategoryId}
                onChange={setExportCategoryId}
                allowClear
                style={{ width: 240 }}
              />
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                현재 데이터 내보내기
              </Button>
            </Space>
          </Space>
        </Card>

        <Card title="3. 업로드">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload.Dragger
              accept=".xlsx,.xls"
              maxCount={1}
              fileList={fileList}
              beforeUpload={(file) => {
                setPendingFile(file);
                setResult(null);
                return false;
              }}
              onRemove={() => {
                setPendingFile(null);
                setResult(null);
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                클릭 또는 드래그하여 엑셀 파일 업로드
              </p>
              <p className="ant-upload-hint">.xlsx 파일만 지원합니다.</p>
            </Upload.Dragger>

            <Space>
              <Checkbox
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
              >
                Dry-run (검증만 수행, 실제 저장하지 않음)
              </Checkbox>
              <Button
                type="primary"
                onClick={handleUpload}
                loading={uploadMutation.isPending}
                disabled={!pendingFile}
              >
                {dryRun ? '검증 실행' : '업로드'}
              </Button>
            </Space>

            {result && (
              <div style={{ marginTop: 8 }}>
                <Alert
                  type={result.failed > 0 ? 'warning' : 'success'}
                  showIcon
                  message={
                    dryRun
                      ? `[Dry-run] 총 ${result.total}건 / 검증 통과 ${result.success}건 / 실패 ${result.failed}건 — 실제 저장되지 않았습니다.`
                      : `총 ${result.total}건 / 등록 ${result.success}건 / 실패 ${result.failed}건`
                  }
                />
                {result.errors.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <Space style={{ marginBottom: 8 }}>
                      <Typography.Text strong>실패 상세</Typography.Text>
                      <Button size="small" onClick={handleDownloadErrors}>
                        실패 내역 엑셀 다운로드
                      </Button>
                    </Space>
                    <Table
                      rowKey={(r) => `${r.row}-${r.reason}`}
                      dataSource={result.errors}
                      size="small"
                      pagination={{ pageSize: 20 }}
                      columns={[
                        { title: '행', dataIndex: 'row', width: 80 },
                        { title: '사유', dataIndex: 'reason' },
                      ]}
                    />
                  </div>
                )}
              </div>
            )}
          </Space>
        </Card>
      </Space>
    </div>
  );
}
