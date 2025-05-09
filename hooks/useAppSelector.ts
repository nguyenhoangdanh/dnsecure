// src/hooks/useAppSelector.ts
import { RootState } from '@/redux-saga/store';
import { useSelector, TypedUseSelectorHook } from 'react-redux';

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;