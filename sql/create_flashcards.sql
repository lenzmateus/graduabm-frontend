-- Tabela de flashcards para estudo
CREATE TABLE IF NOT EXISTS flashcards (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  frente      text NOT NULL,
  verso       text NOT NULL,
  area        text NOT NULL CHECK (area IN ('AT1','AT2','AT3','AT4','AT5')),
  curso       text NOT NULL DEFAULT 'ambos' CHECK (curso IN ('ctsp','cba','ambos')),
  legislacao  text,
  ativa       boolean NOT NULL DEFAULT true,
  fonte       text NOT NULL DEFAULT 'manual' CHECK (fonte IN ('manual','ia')),
  criado_em   timestamptz DEFAULT now()
);

-- Índices para as queries mais frequentes
CREATE INDEX IF NOT EXISTS idx_flashcards_area  ON flashcards (area);
CREATE INDEX IF NOT EXISTS idx_flashcards_curso ON flashcards (curso);
CREATE INDEX IF NOT EXISTS idx_flashcards_ativa ON flashcards (ativa);

-- RLS: apenas usuários autenticados podem ler flashcards ativos
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de flashcards ativos"
  ON flashcards FOR SELECT
  USING (ativa = true);

-- Service role bypassa RLS automaticamente (para o backend com service key)
