CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  cuisine_type TEXT NOT NULL,
  prep_time INT,
  difficulty TEXT CHECK (difficulty IN ('facile','moyen','difficile')),
  calories INT,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  recipe_steps JSONB,
  ingredients JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'waiting'
    CHECK (status IN ('waiting','active','matched','closed')),
  max_participants INT DEFAULT 2,
  match_dish_id UUID REFERENCES dishes(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  matched_at TIMESTAMPTZ
);

CREATE TABLE session_participants (
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (session_id, user_id)
);

CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  dish_id UUID REFERENCES dishes(id),
  direction TEXT CHECK (direction IN ('right','left','up')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, user_id, dish_id)
);

CREATE TABLE wishlist (
  user_id UUID REFERENCES users(id),
  dish_id UUID REFERENCES dishes(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, dish_id)
);

CREATE INDEX idx_swipes_session ON swipes(session_id);
CREATE INDEX idx_swipes_user ON swipes(user_id);
CREATE INDEX idx_sessions_code ON sessions(code);

ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dishes_public" ON dishes FOR SELECT USING (true);
CREATE POLICY "own_swipes" ON swipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);
