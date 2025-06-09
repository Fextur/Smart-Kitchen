export const useDietaryOptions = () => {
  const dietaryOptions = [
    { value: "kosher", label: "כשר" },
    { value: "vegan", label: "טבעוני" },
    { value: "vegetarian", label: "צמחוני" },
    { value: "gluten-free", label: "ללא גלוטן" },
    { value: "keto", label: "קטוגני" },
    { value: "halal", label: "חלאל" },
  ];

  return dietaryOptions;
};
