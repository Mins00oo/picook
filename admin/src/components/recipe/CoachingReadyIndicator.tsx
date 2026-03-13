import { Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export default function CoachingReadyIndicator({ ready }: { ready: boolean }) {
  if (ready) {
    return (
      <Tag icon={<CheckCircleOutlined />} color="success">
        코칭 준비 완료
      </Tag>
    );
  }
  return (
    <Tooltip title="일부 조리 단계에 소요시간(durationSeconds)이 입력되지 않았습니다.">
      <Tag icon={<CloseCircleOutlined />} color="error">
        코칭 미준비
      </Tag>
    </Tooltip>
  );
}
