import { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Drawer,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import {
  PlusOutlined,
  FilterOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import {
  getIngredients,
  deleteIngredient,
  exportIngredients,
  bulkDeleteIngredients,
  bulkMoveIngredients,
} from '@/api/ingredientApi';
import { getCategories } from '@/api/categoryApi';
import { getSubcategories } from '@/api/subcategoryApi';
import { showConfirm } from '@/components/common/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/utils/format';
import type { AdminIngredientResponse } from '@/types/ingredient';

const SORT_OPTIONS = [
  { value: 'name,asc', label: '이름 오름차순' },
  { value: 'name,desc', label: '이름 내림차순' },
  { value: 'createdAt,desc', label: '최근 등록순' },
  { value: 'updatedAt,desc', label: '최근 수정순' },
];

export default function IngredientList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canWrite } = usePermission();

  const [page, setPage] = useState(0);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [hasSubcategory, setHasSubcategory] = useState<boolean | undefined>(undefined);
  const [hasEmoji, setHasEmoji] = useState<boolean | undefined>(undefined);
  const [sort, setSort] = useState<string>('name,asc');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTargetCategoryId, setMoveTargetCategoryId] = useState<number | undefined>();
  const [moveTargetSubcategoryId, setMoveTargetSubcategoryId] = useState<number | undefined>();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => getSubcategories(categoryId),
    enabled: !!categoryId,
  });

  const { data: moveTargetSubs } = useQuery({
    queryKey: ['subcategories', moveTargetCategoryId],
    queryFn: () => getSubcategories(moveTargetCategoryId),
    enabled: !!moveTargetCategoryId,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      'ingredients',
      page,
      categoryId,
      subcategoryId,
      keyword,
      hasSubcategory,
      hasEmoji,
      sort,
    ],
    queryFn: () =>
      getIngredients({
        page,
        size: 20,
        categoryId,
        subcategoryId,
        keyword: keyword || undefined,
        hasSubcategory,
        hasEmoji,
        sort,
      }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (err: { message?: string }) =>
      message.error(err?.message ?? '삭제에 실패했습니다.'),
  });

  const bulkDeleteMut = useMutation({
    mutationFn: bulkDeleteIngredients,
    onSuccess: (res) => {
      if (res.skipped > 0) {
        const reasons = res.skipReasons
          .slice(0, 5)
          .map((r) => `• id=${r.id}: ${r.reason}`)
          .join('\n');
        message.warning(
          `${res.deleted}건 삭제, ${res.skipped}건 skip\n${reasons}${res.skipReasons.length > 5 ? '\n…' : ''}`,
        );
      } else {
        message.success(`${res.deleted}건 삭제되었습니다.`);
      }
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (err: { message?: string }) =>
      message.error(err?.message ?? '일괄 삭제 실패'),
  });

  const bulkMoveMut = useMutation({
    mutationFn: bulkMoveIngredients,
    onSuccess: () => {
      message.success(`${selectedIds.length}건 이동되었습니다.`);
      setSelectedIds([]);
      setMoveModalOpen(false);
      setMoveTargetCategoryId(undefined);
      setMoveTargetSubcategoryId(undefined);
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (err: { message?: string }) =>
      message.error(err?.message ?? '일괄 이동 실패'),
  });

  const handleExport = async () => {
    try {
      const blob = await exportIngredients({
        categoryId,
        subcategoryId,
        keyword: keyword || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ingredients-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      message.error('엑셀 다운로드에 실패했습니다.');
    }
  };

  const handleBulkDelete = () => {
    showConfirm({
      title: `${selectedIds.length}건 재료 삭제`,
      content: '레시피에서 사용 중인 재료는 자동으로 건너뜁니다. 계속할까요?',
      onConfirm: () => bulkDeleteMut.mutate({ ids: selectedIds }),
    });
  };

  const handleBulkMove = () => {
    if (!moveTargetCategoryId) {
      message.warning('대상 카테고리를 선택하세요.');
      return;
    }
    bulkMoveMut.mutate({
      ids: selectedIds,
      targetCategoryId: moveTargetCategoryId,
      targetSubcategoryId: moveTargetSubcategoryId ?? null,
    });
  };

  const categoryOptions = useMemo(
    () =>
      categories?.map((c) => ({
        value: c.id,
        label: `${c.emoji ? c.emoji + ' ' : ''}${c.name}`,
      })) ?? [],
    [categories],
  );

  const subcategoryOptions = useMemo(
    () =>
      subcategories?.map((s) => ({
        value: s.id,
        label: `${s.emoji ? s.emoji + ' ' : ''}${s.name}`,
      })) ?? [],
    [subcategories],
  );

  const columns: ColumnsType<AdminIngredientResponse> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '',
      dataIndex: 'resolvedEmoji',
      width: 50,
      render: (v?: string | null) =>
        v ? (
          <span style={{ fontSize: 22 }}>{v}</span>
        ) : (
          <span style={{ color: '#ccc' }}>∅</span>
        ),
    },
    {
      title: '재료명',
      dataIndex: 'name',
      render: (name: string, record: AdminIngredientResponse) =>
        canWrite ? (
          <a onClick={() => navigate(`/ingredients/${record.id}/edit`)}>{name}</a>
        ) : (
          name
        ),
    },
    {
      title: '카테고리',
      width: 220,
      render: (_: unknown, r: AdminIngredientResponse) => (
        <Space size={4} wrap>
          <Tag>{r.categoryName}</Tag>
          {r.subcategoryName ? (
            <Tag color="blue">{r.subcategoryName}</Tag>
          ) : (
            <Tag color="red">서브 미할당</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '동의어',
      dataIndex: 'synonyms',
      render: (v: string[]) => {
        const list = v ?? [];
        const shown = list.slice(0, 3);
        const more = list.length - shown.length;
        return (
          <Space size={4} wrap>
            {shown.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
            {more > 0 && <Tag>+{more}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '사용 레시피',
      dataIndex: 'usedRecipeCount',
      width: 100,
      render: (n: number) => (
        <span style={{ color: n === 0 ? '#999' : undefined }}>{n}</span>
      ),
    },
    {
      title: '수정일',
      dataIndex: 'updatedAt',
      width: 110,
      render: (v: string) => formatDate(v),
    },
    {
      title: '액션',
      width: 140,
      render: (_: unknown, record: AdminIngredientResponse) =>
        canWrite && (
          <Space size="small">
            <Button size="small" onClick={() => navigate(`/ingredients/${record.id}/edit`)}>
              수정
            </Button>
            <Button
              size="small"
              danger
              onClick={() =>
                showConfirm({
                  title: '재료 삭제',
                  content: `"${record.name}"을(를) 삭제하시겠습니까?`,
                  onConfirm: () => deleteMut.mutate(record.id),
                })
              }
            >
              삭제
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          options={categoryOptions}
          value={categoryId}
          onChange={(v) => {
            setCategoryId(v);
            setSubcategoryId(undefined);
            setPage(0);
          }}
          style={{ width: 180 }}
          allowClear
          placeholder="카테고리"
        />
        <Select
          options={subcategoryOptions}
          value={subcategoryId}
          onChange={(v) => {
            setSubcategoryId(v);
            setPage(0);
          }}
          style={{ width: 180 }}
          allowClear
          disabled={!categoryId}
          placeholder="서브카테고리"
        />
        <Input.Search
          placeholder="재료명 검색"
          onSearch={(v) => {
            setKeyword(v);
            setPage(0);
          }}
          style={{ width: 200 }}
          allowClear
        />
        <Button icon={<FilterOutlined />} onClick={() => setAdvancedOpen(true)}>
          고급 필터
        </Button>
        <Select
          style={{ width: 160 }}
          value={sort}
          onChange={setSort}
          options={SORT_OPTIONS}
        />
        {canWrite && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/ingredients/new')}
          >
            재료 등록
          </Button>
        )}
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          엑셀 다운로드
        </Button>
        {canWrite && (
          <Button
            icon={<UploadOutlined />}
            onClick={() => navigate('/ingredients/bulk-upload')}
          >
            엑셀 업로드
          </Button>
        )}
      </Space>

      {selectedIds.length > 0 && canWrite && (
        <div
          style={{
            background: '#e6f7ff',
            padding: 12,
            borderRadius: 4,
            marginBottom: 12,
          }}
        >
          <Space>
            <span>{selectedIds.length}개 선택됨</span>
            <Button onClick={() => setMoveModalOpen(true)}>카테고리/서브 이동</Button>
            <Button danger onClick={handleBulkDelete} loading={bulkDeleteMut.isPending}>
              선택 삭제
            </Button>
            <Button onClick={() => setSelectedIds([])}>선택 해제</Button>
          </Space>
        </div>
      )}

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.content}
        loading={isLoading}
        rowSelection={
          canWrite
            ? {
                selectedRowKeys: selectedIds,
                onChange: (keys) => setSelectedIds(keys as number[]),
                preserveSelectedRowKeys: true,
              }
            : undefined
        }
        pagination={{
          current: page + 1,
          pageSize: 20,
          total: data?.totalElements,
          showSizeChanger: false,
          onChange: (p) => setPage(p - 1),
        }}
      />

      <Drawer
        title="고급 필터"
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        width={320}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>데이터 품질</div>
            <Space direction="vertical">
              <Checkbox
                checked={hasSubcategory === false}
                onChange={(e) =>
                  setHasSubcategory(e.target.checked ? false : undefined)
                }
              >
                서브카테고리 미할당만
              </Checkbox>
              <Checkbox
                checked={hasEmoji === false}
                onChange={(e) => setHasEmoji(e.target.checked ? false : undefined)}
              >
                이모지 미할당만
              </Checkbox>
              <Checkbox
                checked={hasSubcategory === true}
                onChange={(e) =>
                  setHasSubcategory(e.target.checked ? true : undefined)
                }
              >
                서브카테고리 할당됨만
              </Checkbox>
              <Checkbox
                checked={hasEmoji === true}
                onChange={(e) => setHasEmoji(e.target.checked ? true : undefined)}
              >
                이모지 할당됨만
              </Checkbox>
            </Space>
          </div>
          <Button
            onClick={() => {
              setHasSubcategory(undefined);
              setHasEmoji(undefined);
            }}
          >
            필터 초기화
          </Button>
        </Space>
      </Drawer>

      <Modal
        title={`${selectedIds.length}건 카테고리/서브 이동`}
        open={moveModalOpen}
        onCancel={() => setMoveModalOpen(false)}
        onOk={handleBulkMove}
        confirmLoading={bulkMoveMut.isPending}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 4 }}>대상 카테고리</div>
            <Select
              style={{ width: '100%' }}
              options={categoryOptions}
              value={moveTargetCategoryId}
              onChange={(v) => {
                setMoveTargetCategoryId(v);
                setMoveTargetSubcategoryId(undefined);
              }}
              placeholder="카테고리 선택"
            />
          </div>
          <div>
            <div style={{ marginBottom: 4 }}>대상 서브카테고리 (선택)</div>
            <Select
              style={{ width: '100%' }}
              options={
                moveTargetSubs?.map((s) => ({
                  value: s.id,
                  label: `${s.emoji ? s.emoji + ' ' : ''}${s.name}`,
                })) ?? []
              }
              value={moveTargetSubcategoryId}
              onChange={setMoveTargetSubcategoryId}
              allowClear
              disabled={!moveTargetCategoryId}
              placeholder="서브카테고리 선택 (비워두면 서브 미할당)"
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
}
