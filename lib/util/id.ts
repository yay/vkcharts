export function createId(instance: any): string {
  const className = instance.constructor.className;

  if (!className) {
    throw new Error(`The ${instance.constructor} is missing the 'className' property.`);
  }

  return className + '-' + (instance.constructor.id = (instance.constructor.id || 0) + 1);
}
