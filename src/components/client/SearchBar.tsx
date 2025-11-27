import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/components/client/AppHeader";

type SearchBarProps = {
  initialKeyword?: string;
  /**
   * Nếu truyền onSubmit thì dùng callback này.
   * Nếu không, component tự navigate tới /tim-kiem?q=...
   */
  onSubmit?: (keyword: string) => void;
  /**
   * "header" = nhỏ gọn, dùng trên AppHeader
   * "hero"   = to, dùng trên trang /tim-kiem
   */
  variant?: "header" | "hero";
  className?: string;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  initialKeyword = "",
  onSubmit,
  variant = "header",
  className,
}) => {
  const [keyword, setKeyword] = useState(initialKeyword);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = keyword.trim();

    if (onSubmit) {
      onSubmit(value);
    } else {
      if (!value) {
        navigate(`/tim-kiem?page=1`);
      } else {
        navigate(`/tim-kiem?q=${encodeURIComponent(value)}&page=1`);
      }
    }
  };

  const commonInputProps = {
    value: keyword,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setKeyword(e.target.value),
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit(e as any);
      }
    },
  };

  if (variant === "hero") {
    // Ô tìm kiếm to ở trang /tim-kiem
    return <></>;
  }

  // Variant header (nhỏ gọn trên AppHeader)
  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-300 bg-white",
        className
      )}
    >
      <button type="submit" className="text-slate-500 hover:text-indigo-600">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>
      <input
        {...commonInputProps}
        placeholder="Tìm kiếm sản phẩm..."
        className="w-full outline-none text-sm placeholder:text-slate-400"
        aria-label="Tìm kiếm sản phẩm"
      />
    </form>
  );
};
