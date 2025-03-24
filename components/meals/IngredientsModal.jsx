'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { FaSpinner } from 'react-icons/fa';
import { Button } from '../ui/button';

export default function IngredientsModal({ open, setOpen, setSelectedItems }) {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchIngredients = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/ingredients');
      if (!res.ok) throw new Error('Failed to fetch ingredients');
      return await res.json();
    } catch (error) {
      setError(error.message);
      return [];
    }
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchIngredients().then((data) => {
        setIngredients(data);
        const uniqueCategories = [
          ...new Set(data.map((item) => item.categories)),
        ];
        setCategories(uniqueCategories);
        setLoading(false);
      });
    }
  }, [open]);

  const toggleIngredientSelection = (ingredient) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleConfirmSelection = () => {
    // console.log('Selected Ingredients:', selectedIngredients);
    setSelectedItems(selectedIngredients);
    setSelectedIngredients([]);
    setSelectedCategory(null);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg h-[550px] rounded-lg">
          <DialogTitle className="text-xl font-bold">เลือกหมวดหมู่</DialogTitle>
          <DialogDescription>
            กรุณาเลือกหมวดหมู่ที่ต้องการดู
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2">
                {error}
              </div>
            )}
          </DialogDescription>

          {loading ? (
            <FaSpinner className=" animate-spin text-4xl" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  <img
                    src={`/images/5group/${category}.png`}
                    alt={category}
                    className="w-24 h-24 object-cover rounded-lg shadow-md"
                  />
                  <span className="mt-2 font-medium">{category}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedCategory && (
        <Dialog
          open={!!selectedCategory}
          onOpenChange={() => setSelectedCategory(null)}
        >
          <DialogContent className="max-w-lg h-[625px] overflow-auto rounded-lg">
            <DialogTitle className="text-xl font-bold">
              {selectedCategory}
            </DialogTitle>
            <DialogDescription>
              กรุณาเลือกวัตถุดิบที่ต้องการเพิ่ม
            </DialogDescription>

            {loading ? (
              <FaSpinner className=" animate-spin text-4xl" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {ingredients
                  .filter((item) => item.categories === selectedCategory)
                  .map((item, index) => (
                    <div
                      key={index}
                      className={`flex flex-col items-center cursor-pointer ${
                        selectedIngredients.includes(item)
                          ? 'border-2 border-maroon'
                          : ''
                      }`}
                      onClick={() => toggleIngredientSelection(item)}
                    >
                      <img
                        src={`/images/ingredients/${item.image}`}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                      />
                      <span className="mt-2 font-medium">{item.name}</span>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button onClick={handleConfirmSelection}>ตกลง</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
