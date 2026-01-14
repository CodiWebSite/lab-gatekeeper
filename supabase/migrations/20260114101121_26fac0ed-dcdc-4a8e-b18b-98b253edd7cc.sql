-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'lab_admin');

-- Create user_roles table (CRITICAL: roles must be in separate table for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    lab_id UUID NULL, -- For lab_admin, this links to their assigned lab
    must_change_password BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create laboratories table
CREATE TABLE public.laboratories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    head_name TEXT NOT NULL,
    head_email TEXT,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create research groups table
CREATE TABLE public.research_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    leader_name TEXT,
    leader_email TEXT,
    members TEXT[],
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create publications table
CREATE TABLE public.publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    journal TEXT,
    year INTEGER NOT NULL,
    volume TEXT,
    pages TEXT,
    doi TEXT,
    url TEXT,
    abstract TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    funding_source TEXT,
    budget TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    project_code TEXT,
    director_name TEXT,
    url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create infrastructure table
CREATE TABLE public.infrastructure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    specifications TEXT,
    responsible_name TEXT,
    responsible_email TEXT,
    external_link TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create media/uploads table
CREATE TABLE public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's lab_id
CREATE OR REPLACE FUNCTION public.get_user_lab_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lab_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Function to check if user can access lab
CREATE OR REPLACE FUNCTION public.can_access_lab(_user_id UUID, _lab_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = 'super_admin' OR (role = 'lab_admin' AND lab_id = _lab_id))
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for laboratories (public read, restricted write)
CREATE POLICY "Anyone can view active laboratories"
ON public.laboratories
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Super admins can manage all laboratories"
ON public.laboratories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Lab admins can update their own laboratory"
ON public.laboratories
FOR UPDATE
TO authenticated
USING (public.can_access_lab(auth.uid(), id))
WITH CHECK (public.can_access_lab(auth.uid(), id));

-- RLS Policies for research_groups
CREATE POLICY "Anyone can view research groups"
ON public.research_groups
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Super admins can manage all research groups"
ON public.research_groups
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Lab admins can manage their lab research groups"
ON public.research_groups
FOR ALL
TO authenticated
USING (public.can_access_lab(auth.uid(), lab_id))
WITH CHECK (public.can_access_lab(auth.uid(), lab_id));

-- RLS Policies for publications
CREATE POLICY "Anyone can view publications"
ON public.publications
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Super admins can manage all publications"
ON public.publications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Lab admins can manage their lab publications"
ON public.publications
FOR ALL
TO authenticated
USING (public.can_access_lab(auth.uid(), lab_id))
WITH CHECK (public.can_access_lab(auth.uid(), lab_id));

-- RLS Policies for projects
CREATE POLICY "Anyone can view projects"
ON public.projects
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Super admins can manage all projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Lab admins can manage their lab projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.can_access_lab(auth.uid(), lab_id))
WITH CHECK (public.can_access_lab(auth.uid(), lab_id));

-- RLS Policies for infrastructure
CREATE POLICY "Anyone can view infrastructure"
ON public.infrastructure
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Super admins can manage all infrastructure"
ON public.infrastructure
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Lab admins can manage their lab infrastructure"
ON public.infrastructure
FOR ALL
TO authenticated
USING (public.can_access_lab(auth.uid(), lab_id))
WITH CHECK (public.can_access_lab(auth.uid(), lab_id));

-- RLS Policies for media
CREATE POLICY "Anyone can view media"
ON public.media
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Super admins can manage all media"
ON public.media
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Lab admins can manage their lab media"
ON public.media
FOR ALL
TO authenticated
USING (public.can_access_lab(auth.uid(), lab_id))
WITH CHECK (public.can_access_lab(auth.uid(), lab_id));

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('lab-uploads', 'lab-uploads', true);

-- Storage policies
CREATE POLICY "Anyone can view lab uploads"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'lab-uploads');

CREATE POLICY "Authenticated users can upload to lab-uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lab-uploads');

CREATE POLICY "Users can update their uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'lab-uploads');

CREATE POLICY "Users can delete their uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'lab-uploads');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_laboratories_updated_at
BEFORE UPDATE ON public.laboratories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_groups_updated_at
BEFORE UPDATE ON public.research_groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_infrastructure_updated_at
BEFORE UPDATE ON public.infrastructure
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_lab_id ON public.user_roles(lab_id);
CREATE INDEX idx_research_groups_lab_id ON public.research_groups(lab_id);
CREATE INDEX idx_publications_lab_id ON public.publications(lab_id);
CREATE INDEX idx_publications_year ON public.publications(year);
CREATE INDEX idx_projects_lab_id ON public.projects(lab_id);
CREATE INDEX idx_infrastructure_lab_id ON public.infrastructure(lab_id);
CREATE INDEX idx_media_lab_id ON public.media(lab_id);