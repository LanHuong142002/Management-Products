import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react';

// Styles
import './index.css';

// Components
import {
  ProductsTable,
  SelectItemProps,
  ProductModal,
  DataProduct,
  NotificationModal,
} from '@components';

// Constants
import { URL_API } from '@constants';

// Services
import { getAllData, deleteData } from '@services';

// Contexts
import { ModalContext } from '@contexts';

const HomeLayout = () => {
  const {
    itemModal,
    notificationModal,
    errorsModal,
    showHideNotificationModal,
    showHideItemModal,
    showHideErrorsModal,
  } = useContext(ModalContext);
  const [status, setStatus] = useState<SelectItemProps[]>([]);
  const [types, setTypes] = useState<SelectItemProps[]>([]);
  const [products, setProducts] = useState<DataProduct[]>([]);
  const [fragProductUpdate, setFragProductUpdate] = useState(false);
  const [filter, setFilter] = useState({
    productName: '',
    statusesId: '',
    typesId: '',
    quantity: '',
    brandName: '',
    price: '',
  });
  const [productItem, setProductItem] = useState<DataProduct>({
    id: '',
    productImage: '',
    productName: '',
    quantity: 0,
    brandImage: '',
    brandName: '',
    statusesId: '',
    typesId: '',
    price: 0,
  });

  /**
   * @description flags to check if the data after
   * editing and deleting has been changed or not
   */
  const handleProductUpdate = useCallback(() => {
    setFragProductUpdate((prev) => !prev);
  }, []);

  /**
   * @description function set product to product state
   *
   * @param {Object} item is product item
   */
  const handleSetProductItem = useCallback((item: DataProduct) => {
    setProductItem(item);
  }, []);

  /**
   * @description function get value search when input change value
   *
   * @param {ChangeEvent} e is event of input
   */
  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    if (name) {
      setFilter((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  }, []);

  /**
   * @description function shows the product modal
   *  and set information of the product in it
   *
   * @param {Object} item is data item after call api
   */
  const handleDataModal = useCallback((item: DataProduct) => {
    showHideItemModal();
    handleSetProductItem(item);
  }, []);

  /**
   * @description function delete of confirm modal
   *
   * @param {String} id is id of product which is selected
   */
  const handleConfirm = useCallback(
    async (id: string) => {
      const product = await deleteData<DataProduct>(URL_API.PRODUCTS, id);

      if ('messageError' in product) {
        showHideErrorsModal(product.messageError);
      } else if (itemModal) {
        showHideItemModal();
        showHideNotificationModal();
      } else {
        showHideNotificationModal();
      }
      handleProductUpdate();
    },
    [itemModal],
  );

  /**
   * @description function cancel/ close errors modal
   */
  const handleCancel = useCallback(() => {
    showHideErrorsModal();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const listTypes = await getAllData<SelectItemProps>(URL_API.TYPES);
      const listStatus = await getAllData<SelectItemProps>(URL_API.STATUSES);

      if ('messageError' in listTypes && !Array.isArray(listTypes)) {
        showHideErrorsModal(listTypes.messageError);
      } else {
        setTypes(listTypes);
      }

      if ('messageError' in listStatus && !Array.isArray(listStatus)) {
        showHideErrorsModal(listStatus.messageError);
      } else {
        setStatus(listStatus);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let param = '&';
    for (const [key, value] of Object.entries(filter)) {
      if (value) {
        param += `${key}_like=${value}&`;
      }
    }

    const fetchData = async () => {
      const listProduct = await getAllData<DataProduct>(
        `${URL_API.PRODUCTS}?_expand=statuses&_expand=types${param}`,
      );

      if ('messageError' in listProduct) {
        showHideErrorsModal(listProduct.messageError);
      } else {
        setProducts(listProduct);
      }
    };
    console.log('asd', `${URL_API.PRODUCTS}?_expand=statuses&_expand=types${param}`);

    fetchData();
  }, [fragProductUpdate, filter]);

  return (
    <main className='main-wrapper'>
      <ProductsTable
        filters={filter}
        products={products}
        status={status}
        types={types}
        onSearch={handleSearch}
        onEdit={handleDataModal}
        handleSetProductItem={handleSetProductItem}
      />
      {itemModal && (
        <ProductModal
          productItem={productItem}
          status={status}
          types={types}
          fragProductUpdate={handleProductUpdate}
        />
      )}
      {notificationModal && (
        <NotificationModal
          id={productItem.id || ''}
          variant='confirm'
          description='Do you want to delete this ?'
          textButtonConfirm='Delete'
          onConfirm={handleConfirm}
          onCancel={showHideNotificationModal}
        />
      )}
      {errorsModal.status && (
        <NotificationModal
          variant='notification'
          description={errorsModal.message}
          onCancel={handleCancel}
        />
      )}
    </main>
  );
};

export default HomeLayout;
