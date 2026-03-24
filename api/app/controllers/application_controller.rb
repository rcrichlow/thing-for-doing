# frozen_string_literal: true

class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordNotDestroyed, with: :render_record_not_destroyed
  rescue_from ActionController::ParameterMissing, with: :render_parameter_missing

  private

  def render_validation_errors(record)
    render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
  end

  def render_not_found(exception)
    resource_name = exception.model.presence || 'Resource'

    render json: { errors: ["#{resource_name} not found"] }, status: :not_found
  end

  def render_record_not_destroyed(exception)
    render_validation_errors(exception.record)
  end

  def render_parameter_missing(exception)
    render json: { errors: [exception.message] }, status: :bad_request
  end

  def ordered_records(records)
    Array(records).sort_by { |record| [record.position || 0, record.id] }
  end
end
