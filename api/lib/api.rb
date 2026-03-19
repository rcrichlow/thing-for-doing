# frozen_string_literal: true

module Api
  class Application < Rails::Engine
    isolate_namespace Api
  end
end
