-- M3: Índices de performance nas questões
-- Melhoram queries filtradas por área temática e legislação
CREATE INDEX IF NOT EXISTS idx_questoes_area       ON questoes(area_tematica);
CREATE INDEX IF NOT EXISTS idx_questoes_legislacao  ON questoes(legislacao_id);

-- M5: Índice no reset_token dos usuários
-- Acelera lookup de redefinição de senha
CREATE INDEX IF NOT EXISTS idx_users_reset_token   ON users(reset_token);
