# frozen_string_literal: true

class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActionController::ParameterMissing, with: :render_parameter_missing

  private

  def render_validation_errors(record)
    render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
  end

  def render_not_found(exception)
    resource_name = exception.model.presence || 'Resource'

    render json: { errors: ["#{resource_name} not found"] }, status: :not_found
  end

  def render_parameter_missing(exception)
    render json: { errors: [exception.message] }, status: :bad_request
  end
end
