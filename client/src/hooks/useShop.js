import { useContext } from 'react';
import { ShopContext } from '../context/ContextStore';

export const useShop = () => useContext(ShopContext);
