'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

const fetchIngredients = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/ingredients');
    if (!res.ok) throw new Error('Failed to fetch ingredients');
    return await res.json();
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
};

const IngredientsModal = ({ open, setOpen, setSelectedItems }) => {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (open) {
      fetchIngredients().then((data) => {
        setIngredients(data);
        const uniqueCategories = [
          ...new Set(data.map((item) => item.categories)),
        ];
        setCategories(uniqueCategories);
      });
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              เลือกหมวดหมู่
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                <img
                  src="/images/logo.png"
                  alt={category}
                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                />
                <span className="mt-2 font-medium">{category}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {selectedCategory && (
        <Dialog
          open={!!selectedCategory}
          onOpenChange={() => setSelectedCategory(null)}
        >
          <DialogContent className="max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedCategory}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {ingredients
                .filter((item) => item.categories === selectedCategory)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setSelectedItems(item);
                      setSelectedCategory(null);
                      setOpen(false);
                    }}
                  >
                    <img
                      src="/images/logo.png"
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg shadow-md"
                    />
                    <span className="mt-2 font-medium">{item.name}</span>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default IngredientsModal;
