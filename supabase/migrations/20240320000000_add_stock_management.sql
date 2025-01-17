 -- 재고 이력 테이블
CREATE TABLE public.stock_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  part_id uuid REFERENCES public.parts NOT NULL,
  quantity integer NOT NULL,
  type text NOT NULL CHECK (type IN ('INCREASE', 'DECREASE')),
  created_by uuid REFERENCES public.users NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 재고 알림 테이블
CREATE TABLE public.stock_alerts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  part_id uuid REFERENCES public.parts NOT NULL,
  threshold integer NOT NULL,
  enabled boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 활동 로그 테이블
CREATE TABLE public.activity_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 추가
CREATE INDEX idx_stock_history_part_id ON public.stock_history(part_id);
CREATE INDEX idx_stock_history_created_by ON public.stock_history(created_by);
CREATE INDEX idx_stock_alerts_part_id ON public.stock_alerts(part_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);