import {
  Typography,
  Box,
  Button,
  TextField,
  Modal,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridSortModel,
} from "@mui/x-data-grid";
import { useEffect, useState, useCallback } from "react";
import ProductForm from "../components/Products/ProductForm";
import { ProductService, type Product } from "../services/productsService";
import { BrandService, type Brand } from "../services/brandService";
import { CategoryService, type Category } from "../services/categoryService";
import { useDispatch, useSelector } from "react-redux";
import { updateTabState } from "../store/tabs/tabsSlice";
import type { RootState } from "../store/store";
import {
  SupercategoryService,
  type Supercategory,
} from "../services/supercategoryService";
import {
  SubcategoryService,
  type Subcategory,
} from "../services/subcategoryService";
import ClearIcon from "@mui/icons-material/Clear";

const productService = new ProductService("http://localhost:3001");
const brandService = new BrandService("http://localhost:3001");
const supercategoryService = new SupercategoryService("http://localhost:3001");
const categoryService = new CategoryService("http://localhost:3001");
const subcategoryService = new SubcategoryService("http://localhost:3001");

export default function Products() {
  const [openForm, setOpenForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const tabState = useSelector(
    (state: RootState) =>
      state.tabs.tabs.find((tab) => tab.id === state.tabs.activeTabId)?.state
  ) as
    | {
        selectedBrand?: string;
        selectedSupercategory?: string;
        selectedCategory?: string;
        selectedSubcategory?: string;
        search?: string;
      }
    | undefined;

  const [selectedSupercategory, setSelectedSupercategory] = useState(
    tabState?.selectedSupercategory || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    tabState?.selectedCategory || ""
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    tabState?.selectedSubcategory || ""
  );
  const [selectedBrand, setSelectedBrand] = useState(
    tabState?.selectedBrand || ""
  );
  const [search, setSearch] = useState(tabState?.search || "");

  const [supercategories, setSupercategories] = useState<Supercategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Paginación y orden
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const dispatch = useDispatch();

  const activeTabId = useSelector((state: RootState) => state.tabs.activeTabId);

  const handleClearFilters = () => {
    setSelectedSupercategory("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    fetchProducts(); // Vuelve a cargar sin filtros
  };

  useEffect(() => {
    dispatch(
      updateTabState({
        id: activeTabId,
        newState: {
          selectedSupercategory,
          selectedCategory,
          selectedSubcategory,
          selectedBrand,
          search,
        },
      })
    );
  }, [
    selectedSupercategory,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    search,
    activeTabId,
    dispatch,
  ]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let products = await productService.getAll();
      const categories = await categoryService.getAll();
      const brands = await brandService.getAll();
      const supercategories = await supercategoryService.getAll();
      const subcategories = await subcategoryService.getAll();
      // Filtro por búsqueda parcial
      if (search.trim()) {
        products = products.filter((p) =>
          p.name.toLowerCase().includes(search.trim().toLowerCase())
        );
      }

      if (selectedBrand) {
        products = products.filter((p) => String(p.brandId) === selectedBrand);
      }
      if (selectedSupercategory) {
        products = products.filter((p) => {
          const category = categories.find(
            (c) => Number(c.id) === Number(p.categoryId)
          );
          return category?.supercategoryId === Number(selectedSupercategory);
        });
      }
      if (selectedCategory) {
        products = products.filter(
          (p) => Number(p.categoryId) === Number(selectedCategory)
        );
      }
      if (selectedSubcategory) {
        products = products.filter(
          (p) => Number(p.subcategoryId) === Number(selectedSubcategory)
        );
      }

      // Orden
      if (sortModel.length > 0) {
        const { field, sort } = sortModel[0];
        type ProductKey = keyof Product;
        const typedField = field as ProductKey;
        products = [...products].sort((a, b) => {
          if (a[typedField] < b[typedField]) return sort === "asc" ? -1 : 1;
          if (a[typedField] > b[typedField]) return sort === "asc" ? 1 : -1;
          return 0;
        });
      }
      const mappedProducts = products.map((p) => {
        return {
          ...p,
          brandName: brands.find((b) => Number(b.id) === p.brandId)?.name || "",
          categoryName:
            categories.find((c) => Number(c.id) === Number(p.categoryId))
              ?.name || "",
          subcategoryName:
            subcategories.find((c) => Number(c.id) === Number(p.subcategoryId))
              ?.name || "",
        };
      });
      setProducts(mappedProducts);
      setCategories(categories);
      setBrands(brands);
      setSupercategories(supercategories);
      setSubcategories(subcategories);
    } catch {
      setSnackbar({
        open: true,
        message: "Error al cargar productos",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    search,
    selectedBrand,
    selectedCategory,
    selectedSubcategory,
    selectedSupercategory,
    sortModel,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.delete(id);
      setSnackbar({
        open: true,
        message: "Producto eliminado",
        severity: "success",
      });
      fetchProducts();
    } catch {
      setSnackbar({
        open: true,
        message: "Error al eliminar",
        severity: "error",
      });
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nombre", flex: 1 },
    { field: "price", headerName: "Precio", flex: 1, type: "number" },
    { field: "stock", headerName: "Stock", flex: 1, type: "number" },
    { field: "brandName", headerName: "Marca", flex: 1 },
    { field: "categoryName", headerName: "Categoría", flex: 1 },
    { field: "subcategoryName", headerName: "Subcategoría", flex: 1 },
    {
      field: "actions",
      headerName: "Acciones",
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleEdit(params.row)}
          >
            Editar
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => handleDelete(params.row.id)}
          >
            Eliminar
          </Button>
        </Box>
      ),
      width: 180,
    },
  ];

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Productos
      </Typography>

      {/* Filtros y búsqueda */}
      <Box mb={2} display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Buscar productos"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            endAdornment: search && (
              <ClearIcon
                fontSize="small"
                titleAccess="Limpiar búsqueda"
                onClick={() => setSearch("")}
                sx={{ cursor: "pointer", ml: 1 }}
              />
            ),
          }}
        />

        <TextField
          select
          label="Supercategoría"
          value={selectedSupercategory}
          onChange={(e) => {
            setSelectedSupercategory(e.target.value);
            setSelectedCategory("");
            setSelectedSubcategory("");
          }}
          sx={{ minWidth: 200 }}
          InputProps={{
            endAdornment: selectedSupercategory && (
              <ClearIcon
                fontSize="small"
                titleAccess="Limpiar"
                onClick={() => {
                  setSelectedSupercategory("");
                  setSelectedCategory("");
                  setSelectedSubcategory("");
                }}
                sx={{ cursor: "pointer", ml: 1 }}
              />
            ),
          }}
        >
          {supercategories.map((sc) => (
            <MenuItem key={sc.id} value={sc.id}>
              {sc.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Categoría"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory("");
          }}
          disabled={!selectedSupercategory}
          sx={{ minWidth: 200 }}
          InputProps={{
            endAdornment: selectedCategory && (
              <ClearIcon
                fontSize="small"
                titleAccess="Limpiar"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedSubcategory("");
                }}
                sx={{ cursor: "pointer", ml: 1 }}
              />
            ),
          }}
        >
          {categories
            .filter((c) => c.supercategoryId === Number(selectedSupercategory))
            .map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
        </TextField>

        <TextField
          select
          label="Subcategoría"
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          disabled={!selectedCategory}
          sx={{ minWidth: 200 }}
          InputProps={{
            endAdornment: selectedSubcategory && (
              <ClearIcon
                fontSize="small"
                titleAccess="Limpiar"
                onClick={() => setSelectedSubcategory("")}
                sx={{ cursor: "pointer", ml: 1 }}
              />
            ),
          }}
        >
          {subcategories
            .filter((s) => s.categoryId === Number(selectedCategory))
            .map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
        </TextField>

        <TextField
          select
          label="Marca"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            endAdornment: selectedBrand && (
              <ClearIcon
                fontSize="small"
                titleAccess="Limpiar"
                onClick={() => setSelectedBrand("")}
                sx={{ cursor: "pointer", ml: 1 }}
              />
            ),
          }}
        >
          {brands.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={fetchProducts}>
          Buscar
        </Button>

        <Button variant="outlined" onClick={handleClearFilters}>
          Limpiar filtros
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setEditProduct(null);
            setOpenForm(true);
          }}
        >
          Crear producto
        </Button>
      </Box>

      {/* Tabla de productos paginada */}
      <Box height={400} mb={2}>
        <DataGrid
          rows={products}
          columns={columns}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={products.length}
          paginationMode="client"
          sortingMode="client"
          onSortModelChange={(model) => setSortModel(model)}
          loading={loading}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Modal para crear/editar producto */}
      <Modal
        disableEscapeKeyDown
        open={openForm}
        onClose={() => setOpenForm(false)}
        hideBackdrop
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            width: "90vw", // Usa el 90% del viewport
            maxWidth: 800,
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          <ProductForm
            initialData={
              editProduct
                ? {
                    ...editProduct,
                    brandId: String(editProduct.brandId),
                    categoryId: String(editProduct.categoryId),
                    subcategoryId: String(editProduct.subcategoryId),
                    // Buscar la supercategoría basada en la categoría del producto
                    supercategoryId: (() => {
                      const category = categories.find(
                        (c) => Number(c.id) === Number(editProduct.categoryId)
                      );
                      return category ? String(category.supercategoryId) : "";
                    })(),
                  }
                : undefined
            }
            onSubmit={async (data) => {
              try {
                if (editProduct) {
                  await productService.update(editProduct.id, {
                    name: data.name,
                    price: data.price,
                    stock: data.stock,
                    brandId: Number(data.brandId),
                    categoryId: data.categoryId,
                    subcategoryId: Number(data.subcategoryId),
                    description: "",
                    sku: "",
                  });
                  setSnackbar({
                    open: true,
                    message: "Producto actualizado",
                    severity: "success",
                  });
                } else {
                  await productService.create({
                    name: data.name,
                    price: data.price,
                    stock: data.stock,
                    brandId: Number(data.brandId),
                    categoryId: data.categoryId,
                    subcategoryId: Number(data.subcategoryId),
                    description: "",
                    sku: "",
                    categoryName: "",
                    brandName: "",
                    subcategoryName: "",
                    supercategoryId: data.supercategoryId,
                  });
                  setSnackbar({
                    open: true,
                    message: "Producto creado",
                    severity: "success",
                  });
                }
                setOpenForm(false);
                setEditProduct(null);
                fetchProducts();
              } catch {
                setSnackbar({
                  open: true,
                  message: "Error al guardar",
                  severity: "error",
                });
              }
            }}
            onCancel={() => {
              dispatch(updateTabState({ id: activeTabId, newState: {} }));
              setOpenForm(false); // o como estés cerrando el modal
              setEditProduct(null);
            }}
          />
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
