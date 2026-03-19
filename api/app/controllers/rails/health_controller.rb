# frozen_string_literal: true

module Rails
  class HealthController < ActionController::Base
    def show
      render json: { status: 'ok' }
    end
  end
end
