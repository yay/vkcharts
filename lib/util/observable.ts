export interface TypedEvent {
  readonly type: string;
}

export interface SourceEvent<S> extends TypedEvent {
  readonly source: S;
}

export interface PropertyChangeEvent<S, V> extends SourceEvent<S> {
  readonly value: V;
  readonly oldValue: V;
}

export type SourceEventListener<S> = (event: SourceEvent<S>) => any;
export type PropertyChangeEventListener<S, V> = (event: PropertyChangeEvent<S, V>) => any;

export class Observable {
  static readonly privateKeyPrefix = '_';

  // Note that these maps can't be specified generically, so they are kept untyped.
  // Some methods in this class only need generics in their signatures, the generics inside the methods
  // are just for clarity. The generics in signatures allow for static type checking of user provided
  // listeners and for type inference, so that the users wouldn't have to specify the type of parameters
  // of their inline lambdas.
  private allPropertyListeners = new Map(); // property name => property change listener => scopes
  private allEventListeners = new Map(); // event type => event listener => scopes

  addPropertyListener<K extends string & keyof this>(
    name: K,
    listener: PropertyChangeEventListener<this, this[K]>,
    scope: object = this,
  ): void {
    const allPropertyListeners = this.allPropertyListeners as Map<
      K,
      Map<PropertyChangeEventListener<this, this[K]>, Set<object>>
    >;
    let propertyListeners = allPropertyListeners.get(name);

    if (!propertyListeners) {
      propertyListeners = new Map<PropertyChangeEventListener<this, this[K]>, Set<object>>();
      allPropertyListeners.set(name, propertyListeners);
    }

    if (!propertyListeners.has(listener)) {
      const scopes = new Set<object>();
      propertyListeners.set(listener, scopes);
    }
    const scopes = propertyListeners.get(listener);
    if (scopes) {
      scopes.add(scope);
    }
  }

  removePropertyListener<K extends string & keyof this>(
    name: K,
    listener?: PropertyChangeEventListener<this, this[K]>,
    scope: object = this,
  ): void {
    const allPropertyListeners = this.allPropertyListeners as Map<
      K,
      Map<PropertyChangeEventListener<this, this[K]>, Set<object>>
    >;
    const propertyListeners = allPropertyListeners.get(name);

    if (propertyListeners) {
      if (listener) {
        const scopes = propertyListeners.get(listener);
        if (scopes) {
          scopes.delete(scope);
          if (!scopes.size) {
            propertyListeners.delete(listener);
          }
        }
      } else {
        propertyListeners.clear();
      }
    }
  }

  protected notifyPropertyListeners<K extends string & keyof this>(name: K, oldValue: this[K], value: this[K]): void {
    const allPropertyListeners = this.allPropertyListeners as Map<
      K,
      Map<PropertyChangeEventListener<this, this[K]>, Set<object>>
    >;
    const propertyListeners = allPropertyListeners.get(name);

    if (propertyListeners) {
      propertyListeners.forEach((scopes, listener) => {
        scopes.forEach((scope) => listener.call(scope, { type: name, source: this, value, oldValue }));
      });
    }
  }

  addEventListener(type: string, listener: SourceEventListener<this>, scope: object = this): void {
    const allEventListeners = this.allEventListeners as Map<string, Map<SourceEventListener<this>, Set<object>>>;
    let eventListeners = allEventListeners.get(type);

    if (!eventListeners) {
      eventListeners = new Map<SourceEventListener<this>, Set<object>>();
      allEventListeners.set(type, eventListeners);
    }

    if (!eventListeners.has(listener)) {
      const scopes = new Set<object>();
      eventListeners.set(listener, scopes);
    }
    const scopes = eventListeners.get(listener);
    if (scopes) {
      scopes.add(scope);
    }
  }

  removeEventListener(type: string, listener?: SourceEventListener<this>, scope: object = this): void {
    const allEventListeners = this.allEventListeners as Map<string, Map<SourceEventListener<this>, Set<object>>>;
    const eventListeners = allEventListeners.get(type);

    if (eventListeners) {
      if (listener) {
        const scopes = eventListeners.get(listener);
        if (scopes) {
          scopes.delete(scope);
          if (!scopes.size) {
            eventListeners.delete(listener);
          }
        }
      } else {
        eventListeners.clear();
      }
    }
  }

  protected notifyEventListeners(types: string[]): void {
    const allEventListeners = this.allEventListeners as Map<string, Map<SourceEventListener<this>, Set<object>>>;

    types.forEach((type) => {
      const listeners = allEventListeners.get(type);
      if (listeners) {
        listeners.forEach((scopes, listener) => {
          scopes.forEach((scope) => listener.call(scope, { type, source: this }));
        });
      }
    });
  }

  // 'source' is added automatically and is always the object this method belongs to.
  fireEvent<E extends TypedEvent>(event: Omit<E, 'source'>): void {
    const listeners = (this.allEventListeners as Map<string, Map<SourceEventListener<this>, Set<object>>>).get(
      event.type,
    );

    if (listeners) {
      listeners.forEach((scopes, listener) => {
        scopes.forEach((scope) => listener.call(scope, { ...event, source: this }));
      });
    }
  }
}

export function reactive(...events: string[]) {
  const debug = events.indexOf('debugger') >= 0;
  return (target: any, key: string) => {
    // `target` is either a constructor (static member) or prototype (instance member)
    const privateKey = Observable.privateKeyPrefix + key;
    const privateKeyEvents = privateKey + 'Events';

    if (!target[key]) {
      if (events) {
        target[privateKeyEvents] = events;
      }
      Object.defineProperty(target, key, {
        set(value: any) {
          const oldValue = this[privateKey];
          // This is a way to stop inside the setter by adding the special
          // 'debugger' event to a reactive property, for example:
          //  @reactive('layoutChange', 'debugger') title?: Caption;
          if (debug) {
            // DO NOT REMOVE
            // biome-ignore lint/suspicious/noDebugger: `debug` is always false, unless explicitly enabled
            debugger;
          }
          if (value !== oldValue || (typeof value === 'object' && value !== null)) {
            this[privateKey] = value;
            this.notifyPropertyListeners(key, oldValue, value);
            const events = this[privateKeyEvents];
            if (events) {
              this.notifyEventListeners(events);
            }
          }
        },
        get(): any {
          return this[privateKey];
        },
        enumerable: true,
        configurable: true,
      });
    }
  };
}
