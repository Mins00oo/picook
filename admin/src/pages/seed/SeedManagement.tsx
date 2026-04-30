import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Space,
  Table,
  Typography,
  Upload,
  message,
  Statistic,
  Row,
  Col,
} from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useMutation } from '@tanstack/react-query';
import {
  uploadSeedExcel,
  downloadSeedExcel,
  type SeedImportResponse,
  type SeedSheetStat,
} from '@/api/seedApi';

const SHEETS: Array<{ key: keyof SeedImportResponse; label: string }> = [
  { key: 'categories', label: 'categories' },
  { key: 'ingredients', label: 'ingredients' },
  { key: 'ingredientSynonyms', label: 'ingredient_synonyms' },
  { key: 'unitConversions', label: 'unit_conversions' },
  { key: 'recipes', label: 'recipes' },
  { key: 'recipeIngredients', label: 'recipe_ingredients' },
  { key: 'recipeSteps', label: 'recipe_steps' },
];

export default function SeedManagement() {
  const [result, setResult] = useState<SeedImportResponse | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: ({ file, dry }: { file: File; dry: boolean }) =>
      uploadSeedExcel(file, dry),
    onSuccess: (data) => {
      setResult(data);
      if (data.totalErrors === 0) {
        message.success(
          dryRun
            ? '검증 통과 — 실제 저장은 안 됨. dryRun 해제 후 재실행.'
            : '시드 데이터가 모두 등록되었습니다.',
        );
      } else {
        message.warning(`총 ${data.totalErrors}건 에러. 실패 상세 확인.`);
      }
    },
    onError: (err: { message?: string }) => {
      message.error(err?.message ?? '업로드 실패');
    },
  });

  const handleUpload = () => {
    if (!pendingFile) {
      message.warning('파일 선택');
      return;
    }
    uploadMutation.mutate({ file: pendingFile, dry: dryRun });
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadSeedExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `picook_seed_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('다운로드 실패');
    }
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

  return (
    <div>
      <h2>시드 데이터 일괄 등록 / 내보내기</h2>
      <Typography.Paragraph type="secondary">
        데이터 파이프라인에서 생성한 <code>picook_seed.xlsx</code> 를 한 번에 업로드.
        7시트 (categories / ingredients / unit_conversions / recipes / recipe_ingredients / recipe_steps / metadata).
      </Typography.Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="현재 데이터 내보내기">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text type="secondary">
              현재 DB에 시드된 데이터 전체를 엑셀로 받아 수정 후 재업로드 가능.
            </Typography.Text>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              picook_seed_YYYY-MM-DD.xlsx 다운로드
            </Button>
          </Space>
        </Card>

        <Card title="업로드">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload.Dragger
              accept=".xlsx"
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
              <p className="ant-upload-text">picook_seed.xlsx 드래그 또는 선택</p>
              <p className="ant-upload-hint">
                7시트 한 파일. 트랜잭션 단위로 처리됨 (실패 시 전체 롤백).
              </p>
            </Upload.Dragger>

            <Space>
              <Checkbox checked={dryRun} onChange={(e) => setDryRun(e.target.checked)}>
                Dry-run (검증만 수행, 실제 저장 X)
              </Checkbox>
              <Button
                type="primary"
                onClick={handleUpload}
                loading={uploadMutation.isPending}
                disabled={!pendingFile}
              >
                {dryRun ? '검증 실행' : '업로드 실행'}
              </Button>
            </Space>
          </Space>
        </Card>

        {result && (
          <Card title="결과">
            <Alert
              type={result.totalErrors > 0 ? 'warning' : 'success'}
              showIcon
              style={{ marginBottom: 16 }}
              message={
                result.dryRun
                  ? `[Dry-run] 총 에러 ${result.totalErrors}건 — 실제 저장되지 않았습니다.`
                  : `시드 등록 완료. 총 에러 ${result.totalErrors}건.`
              }
            />

            <Row gutter={[16, 16]}>
              {SHEETS.map(({ key, label }) => {
                const stat = result[key] as SeedSheetStat;
                return (
                  <Col span={6} key={label}>
                    <Card size="small" title={label}>
                      <Statistic
                        value={stat.success}
                        suffix={`/ ${stat.total}`}
                        valueStyle={{
                          color: stat.failed > 0 ? '#cf1322' : '#3f8600',
                          fontSize: 18,
                        }}
                      />
                      {stat.failed > 0 && (
                        <Typography.Text type="danger">실패 {stat.failed}건</Typography.Text>
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {result.errors.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Typography.Title level={5}>실패 상세 ({result.errors.length}건)</Typography.Title>
                <Table
                  rowKey={(r) => `${r.sheet}-${r.row}-${r.reason}`}
                  dataSource={result.errors}
                  size="small"
                  pagination={{ pageSize: 30 }}
                  columns={[
                    { title: '시트', dataIndex: 'sheet', width: 160 },
                    { title: '행', dataIndex: 'row', width: 80 },
                    { title: '사유', dataIndex: 'reason' },
                  ]}
                />
              </div>
            )}
          </Card>
        )}
      </Space>
    </div>
  );
}
