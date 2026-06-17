/**
 * JSON Schema for validating activity response objects.
 */
export const activityResponseSchema = {
  type: 'object',
  required: ['id', 'emissionKg', 'timestamp'],
  properties: {
    id: { type: 'string' },
    emissionKg: { type: 'number', minimum: 0 },
    timestamp: { type: 'string', format: 'date-time' },
    input: { type: 'object' },
    instantInsight: { type: ['string', 'null'] }
  },
  additionalProperties: true
};
