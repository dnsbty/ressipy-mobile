import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Category = {
  name: string;
  slug: string;
};

type CategoryContextType = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
};

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  isLoading: false,
  error: null,
});

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://ressipy.com/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, isLoading, error }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}
