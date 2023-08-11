import { createRegistry, Registry, ModuleFactory } from './registry';
import { isUndefinedModuleError } from './undefined-module';

// foo module mock.
const fooMock = jest.fn<string, [number]>(() => 'foo');

const fooFactory: ModuleFactory<typeof fooMock, fooContext> = jest.fn(
  () => fooMock
);

// foo factory context declare.
interface fooContext {
  a: string;
}

// Registry declare.
interface TestRegistryMap {
  foo: ModuleFactory<typeof fooMock, fooContext>;
}

function createTestRegistry(
  defaults: Partial<TestRegistryMap>
): Registry<TestRegistryMap> {
  return createRegistry<TestRegistryMap>(defaults);
}

describe('createModuleRegistry', () => {
  let reset: (() => void) | undefined;

  beforeEach(() => {
    reset?.();
    jest.clearAllMocks();
  });

  test('define registry', () => {
    // createRegistry with an empty defaults.
    const r1 = createTestRegistry({});
    expect(r1.isDefined('foo')).toBeFalsy();

    // createRegistry with a defined defaults.
    const r2 = createTestRegistry({
      foo: fooFactory
    });
    expect(r2.isDefined('foo')).toBeTruthy();

    // registry.define should override defaults.
    const r3 = createTestRegistry({});
    const resetR3 = r3.define({
      foo: fooFactory
    });
    expect(r3.isDefined('foo')).toBeTruthy();

    // registry.define should be able to reset.
    resetR3();
    expect(r3.isDefined('foo')).toBeFalsy();

    // registry.inject should override defaults.
    const r4 = createTestRegistry({});
    const resetR4 = r4.inject('foo', fooFactory);
    expect(r4.isDefined('foo')).toBeTruthy();

    // registry.inject should be able to reset.
    resetR4();
    expect(r4.isDefined('foo')).toBeFalsy();
  });

  test('registry.require', () => {
    const registry = createTestRegistry({
      foo: fooFactory
    });

    const context = { a: 'a' };
    const foo = registry.require('foo', context);

    expect(fooFactory).toBeCalledWith(context);

    const input = 7;
    foo(input);
    expect(fooMock).toBeCalledWith(input);
  });

  it('should throw error on require if Module is not defined', () => {
    const registry = createTestRegistry({});

    expect(() => {
      try {
        // Throws error if foo is not defined.
        registry.require('foo', { a: 'a' });
      } catch (err) {
        // Error can be identified by isUndefinedModuleError.
        expect(isUndefinedModuleError(err)).toBeTruthy();
        throw err;
      }
    }).toThrowError();
  });
});
