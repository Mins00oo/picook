import { Input } from 'antd';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function ImageUpload({ value, onChange, placeholder }: Props) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder ?? 'https://...'}
    />
  );
}
