import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateTabState } from "../../store/tabs/tabsSlice";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { BrandService } from "../../services/brandService";
import { SupercategoryService } from "../../services/supercategoryService";
import { CategoryService } from "../../services/categoryService";
import { SubcategoryService } from "../../services/subcategoryService";

const brandService = new BrandService("http://localhost:3001");
const supercategoryService = new SupercategoryService("http://localhost:3001");
const categoryService = new CategoryService("http://localhost:3001");
const subcategoryService = new SubcategoryService("http://localhost:3001");

// Esquema de validación
const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  price: z.number().min(0, "El precio debe ser positivo"),
  stock: z.number().int().min(0, "El stock debe ser positivo"),
  brandId: z.string().min(1, "La marca es obligatoria"),
  supercategoryId: z.string().min(1, "La supercategoría es obligatoria"),
  categoryId: z.string().min(1, "La categoría es obligatoria"),
  subcategoryId: z.string().min(1, "La subcategoría es obligatoria"),
});

type ProductFormData = z.infer<typeof schema>;

export default function ProductFormComponent({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}) {
  const dispatch = useAppDispatch();
  const { tabs, activeTabId } = useAppSelector((state) => state.tabs);
  const tabState = tabs.find((tab) => tab.id === activeTabId)?.state as
    | ProductFormData
    | undefined;

  // Selectores encadenados
  const [supercategories, setSupercategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { value: string; label: string; supercategoryId: string }[]
  >([]);
  const [subcategories, setSubcategories] = useState<
    { value: string; label: string; categoryId: string }[]
  >([]);
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const defaultValues: ProductFormData = {
    name: "",
    price: 0,
    stock: 0,
    brandId: "",
    supercategoryId: "",
    categoryId: "",
    subcategoryId: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState,
    control,
    setValue,
    getValues,
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const lastValues = useRef<Partial<ProductFormData>>({});

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [
          supercategoriesData,
          brandsData,
          categoriesData,
          subcategoriesData,
        ] = await Promise.all([
          supercategoryService.getAll(),
          brandService.getAll(),
          categoryService.getAll(),
          subcategoryService.getAll(),
        ]);

        const mappedSupercategories = supercategoriesData.map((s) => ({
          value: String(s.id),
          label: s.name,
        }));

        const mappedBrands = brandsData.map((b) => ({
          value: String(b.id),
          label: b.name,
        }));

        const mappedCategories = categoriesData.map((c) => ({
          value: String(c.id),
          label: c.name,
          supercategoryId: String(c.supercategoryId),
        }));

        const mappedSubcategories = subcategoriesData.map((s) => ({
          value: String(s.id),
          label: s.name,
          categoryId: String(s.categoryId),
        }));

        setSupercategories(mappedSupercategories);
        setBrands(mappedBrands);
        setCategories(mappedCategories);
        setSubcategories(mappedSubcategories);

        // Inicializar valores del formulario
        let initialFormData: ProductFormData;

        if (initialData && Object.keys(initialData).length > 0) {
          // Para edición - buscar supercategoryId si no está presente
          let supercategoryId = initialData.supercategoryId || "";
          if (initialData.categoryId && !supercategoryId) {
            const category = mappedCategories.find(
              (c) => c.value === String(initialData.categoryId)
            );
            supercategoryId = category?.supercategoryId || "";
          }

          initialFormData = {
            name: initialData.name || "",
            price: initialData.price || 0,
            stock: initialData.stock || 0,
            brandId: String(initialData.brandId || ""),
            supercategoryId: supercategoryId,
            categoryId: String(initialData.categoryId || ""),
            subcategoryId: String(initialData.subcategoryId || ""),
          };
        } else if (tabState && Object.keys(tabState).length > 0) {
          initialFormData = tabState;
        } else {
          initialFormData = defaultValues;
        }

        reset(initialFormData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading form data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialData, tabState, reset]);

  // Actualizar estado de la tab (solo cuando sea necesario)
  useEffect(() => {
    if (isLoading) return;

    const subscription = setTimeout(() => {
      const currentValues = getValues();
      const valuesChanged =
        JSON.stringify(lastValues.current) !== JSON.stringify(currentValues);

      if (valuesChanged) {
        lastValues.current = currentValues;
        dispatch(updateTabState({ id: activeTabId, newState: currentValues }));
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(subscription);
  }, [getValues, activeTabId, dispatch]);

  // Obtener opciones filtradas de forma estable
  const getFilteredCategories = (supercategoryId: string) => {
    return categories.filter((c) => c.supercategoryId === supercategoryId);
  };

  const getFilteredSubcategories = (categoryId: string) => {
    return subcategories.filter((s) => s.categoryId === categoryId);
  };

  // Confirmación de cierre
  const [confirmClose, setConfirmClose] = useState(false);
  const isDirty = formState.isDirty;

  const handleCancel = () => {
    if (isDirty) {
      setConfirmClose(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmClose = () => {
    setConfirmClose(false);
    onCancel();
  };

  if (isLoading) {
    return (
      <Box p={2}>
        <Typography>Cargando formulario...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} p={2}>
        <Typography variant="h6" gutterBottom>
          {initialData && Object.keys(initialData).length > 0
            ? "Editar producto"
            : "Crear producto"}
        </Typography>

        <TextField
          label="Nombre"
          fullWidth
          margin="normal"
          {...register("name")}
          error={!!formState.errors.name}
          helperText={formState.errors.name?.message}
        />

        <TextField
          label="Precio"
          type="number"
          fullWidth
          margin="normal"
          {...register("price", { valueAsNumber: true })}
          error={!!formState.errors.price}
          helperText={formState.errors.price?.message}
        />

        <TextField
          label="Stock"
          type="number"
          fullWidth
          margin="normal"
          {...register("stock", { valueAsNumber: true })}
          error={!!formState.errors.stock}
          helperText={formState.errors.stock?.message}
        />

        <Controller
          name="brandId"
          control={control}
          render={({ field }) => (
            <TextField
              label="Marca"
              select
              fullWidth
              margin="normal"
              {...field}
              error={!!formState.errors.brandId}
              helperText={formState.errors.brandId?.message}
            >
              {brands.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="supercategoryId"
          control={control}
          render={({ field }) => (
            <TextField
              label="Supercategoría"
              select
              fullWidth
              margin="normal"
              {...field}
              onChange={(e) => {
                field.onChange(e);
                // Limpiar campos dependientes
                setValue("categoryId", "", { shouldDirty: true });
                setValue("subcategoryId", "", { shouldDirty: true });
              }}
              error={!!formState.errors.supercategoryId}
              helperText={formState.errors.supercategoryId?.message}
            >
              {supercategories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => {
            const currentSupercategory = getValues("supercategoryId");
            const filteredCategories =
              getFilteredCategories(currentSupercategory);

            return (
              <TextField
                label="Categoría"
                select
                fullWidth
                margin="normal"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  // Limpiar subcategoría
                  setValue("subcategoryId", "", { shouldDirty: true });
                }}
                error={!!formState.errors.categoryId}
                helperText={formState.errors.categoryId?.message}
                disabled={!currentSupercategory}
              >
                {filteredCategories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            );
          }}
        />

        <Controller
          name="subcategoryId"
          control={control}
          render={({ field }) => {
            const currentCategory = getValues("categoryId");
            const filteredSubcategories =
              getFilteredSubcategories(currentCategory);

            return (
              <TextField
                label="Subcategoría"
                select
                fullWidth
                margin="normal"
                {...field}
                error={!!formState.errors.subcategoryId}
                helperText={formState.errors.subcategoryId?.message}
                disabled={!currentCategory}
              >
                {filteredSubcategories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            );
          }}
        />

        <Box mt={2} display="flex" gap={2}>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
          <Button onClick={handleCancel} variant="outlined">
            Cancelar
          </Button>
        </Box>
      </Box>

      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>¿Salir sin guardar?</DialogTitle>
        <DialogContent>
          Tienes cambios sin guardar. ¿Seguro que quieres salir?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>No</Button>
          <Button onClick={handleConfirmClose} color="error">
            Sí, salir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
