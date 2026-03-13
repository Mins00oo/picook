import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface Props {
  title: string;
  content: string;
  onConfirm: () => void;
}

export function showConfirm({ title, content, onConfirm }: Props) {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText: '확인',
    cancelText: '취소',
    onOk: onConfirm,
  });
}
