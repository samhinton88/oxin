import { act, renderHook } from '@testing-library/react-hooks';

import { useOxin } from '../hook';
import { OxinProps } from '../types';
import { initialState, reducer } from '../reducer';

describe('Oxin state', () => {
  it('reducer returns default state', () => {
    expect(reducer(initialState, { type: 'SOME_ACTION' } as any)).toEqual(
      initialState,
    );
  });

  it('useOxin returns initial state', () => {
    const {
      result: { current },
    } = renderHook(() => useOxin());

    expect(current.inputState).toEqual(initialState);
  });

  it('adds fields to state', async () => {
    const { result } = renderHook(() => useOxin());

    act(() => {
      result.current.inputProps({ name: 'myField' });
      result.current.inputProps({ name: 'myOtherField' });
    });

    // touched, validating, values
    expect(result.current.inputState.touched).toEqual({
      myField: false,
      myOtherField: false,
    });

    expect(result.current.inputState.validating).toEqual({
      myField: false,
      myOtherField: false,
    });

    expect(result.current.inputState.values).toEqual({
      myField: null,
      myOtherField: null,
    });
  });

  describe('onChange', () => {
    it('updates field value', () => {
      const { result } = renderHook(() => useOxin());

      act(() => {
        const props = result.current.inputProps({ name: 'myField' });

        props.onChange('Some value');
      });

      expect(result.current.inputState.values.myField).toBe('Some value');
    });
  });

  describe('onRemove', () => {
    it('removes a field', () => {
      const { result } = renderHook(() => useOxin());

      act(() => {
        result.current.inputProps({ name: 'myField' });

        result.current.inputProps({
          name: 'myOtherField',
        });
      });

      expect(result.current.inputState.values).toEqual({
        myField: null,
        myOtherField: null,
      });

      expect(result.current.inputState.values).toEqual({
        myField: null,
        myOtherField: null,
      });
    });
  });

  it('handles validation state changes', async () => {
    let props = {} as OxinProps;
    const { result, waitForNextUpdate } = renderHook(() => useOxin());

    await act(async () => {
      props = result.current.inputProps({
        name: 'myField',
        validators: [
          function validator1(value: any) {
            return !!value;
          },
          [
            function validator2(value: any) {
              return value === true || value === null;
            },
            'Some validation message',
          ],
        ],
      });

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(false);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: false },
        validator2: { message: 'Some validation message', valid: false },
      },
    });

    await act(async () => {
      props.onChange([]);

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(false);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: true },
        validator2: { message: 'Some validation message', valid: false },
      },
    });

    await act(async () => {
      props.onChange(false);

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(false);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: false },
        validator2: { message: 'Some validation message', valid: false },
      },
    });

    await act(async () => {
      props.onChange(null);

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(false);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: false },
        validator2: { message: 'Some validation message', valid: true },
      },
    });

    await act(async () => {
      props.onChange(true);

      await waitForNextUpdate();
    });

    expect(result.current.inputState.valid).toEqual(true);
    expect(result.current.inputState.validation).toEqual({
      myField: {
        validator1: { message: undefined, valid: true },
        validator2: { message: 'Some validation message', valid: true },
      },
    });
  });
});
