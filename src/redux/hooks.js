import { useDispatch, useSelector } from 'react-redux';

/**
 * Pre-typed hooks for standardized store interaction across client components.
 */
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
